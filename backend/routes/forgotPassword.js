// forgotPassword.js - avec implémentation complète d'envoi d'email

const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../config/db");
const router = express.Router();
const crypto = require("crypto");
const nodemailer = require("nodemailer"); // N'oubliez pas d'installer ce package

// Configuration du transporteur d'email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sersif.a366@ucd.ac.ma', // Votre email
    pass: 'kvlq jczz kyla svdl'    // Votre mot de passe d'application
  }
});



// Demande de réinitialisation de mot de passe
router.post("/request", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email requis" });
  }

  db.query(
    "SELECT id, name FROM users WHERE email = ?",
    [email],
    (err, results) => {
      if (err) {
        console.error("Erreur de base de données:", err);
        return res.status(500).json({ message: "Erreur serveur" });
      }

      // Pour des raisons de sécurité, nous renvoyons la même réponse même si l'email n'existe pas
      if (results.length === 0) {
        return res.json({ 
          message: "Si votre email existe dans notre système, vous recevrez un lien de réinitialisation."
        });
      }

      const userId = results[0].id;
      const userName = results[0].name;
      
      // Générer un token sécurisé
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      
      // Définir l'expiration à 1 heure
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);
      
      // Supprimer tout token existant pour cet utilisateur
      db.query(
        "DELETE FROM password_reset_tokens WHERE user_id = ?",
        [userId],
        (err) => {
          if (err) {
            console.error("Erreur lors de la suppression des anciens tokens:", err);
          }
          
          // Insérer le nouveau token
          db.query(
            "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
            [userId, hashedToken, expiresAt],
            (err) => {
              if (err) {
                console.error("Erreur lors de l'enregistrement du token:", err);
                return res.status(500).json({ message: "Erreur serveur" });
              }
              
              // URL pour la réinitialisation
              const baseUrl = process.env.FRONTEND_URL || "http://192.168.1.172:3000";
              const resetUrl = `${baseUrl}/ResetPassword?token=${resetToken}`;
              
              // Envoyer l'email avec le lien de réinitialisation
              const mailOptions = {
                from: '"Bibliothèque Virtuelle" <sersif.a366@ucd.ac.ma>',
                to: email,
                subject: 'Réinitialisation de votre mot de passe',
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <h1 style="color: #3a416f; text-align: center;">Réinitialisation de mot de passe</h1>
                    <p>Bonjour ${userName},</p>
                    <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Bibliothèque Virtuelle.</p>
                    <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
                    <div style="text-align: center; margin: 25px 0;">
                      <a href="${resetUrl}" style="background-color: #4F6CE1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Réinitialiser mon mot de passe</a>
                    </div>
                    <p>Ce lien expirera dans 1 heure.</p>
                    <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
                    <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 10px;">
                      Cet email a été envoyé automatiquement, merci de ne pas y répondre.
                    </p>
                  </div>
                `
              };
              
              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  console.error("Erreur d'envoi d'email:", error);
                  // On continue néanmoins pour ne pas compromettre la sécurité
                } else {
                  console.log('Email envoyé: ' + info.response);
                }
                
                // Réponse standard pour des raisons de sécurité
                res.json({ 
                  message: "Si votre email existe dans notre système, vous recevrez un lien de réinitialisation."
                });
              });
            }
          );
        }
      );
    }
  );
});

// Réinitialiser le mot de passe
router.post("/reset", (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: "Token et nouveau mot de passe requis" });
  }

  // Validation de la complexité du mot de passe
  if (newPassword.length < 6) {
    return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères" });
  }
  
  // Hacher le token reçu pour le comparer avec celui stocké
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
  // Vérifier si le token existe et n'est pas expiré
  db.query(
    "SELECT p.*, u.email, u.name FROM password_reset_tokens p JOIN users u ON p.user_id = u.id WHERE p.token = ? AND p.expires_at > NOW() AND p.used = FALSE",
    [hashedToken],
    async (err, results) => {
      if (err) {
        console.error("Erreur de base de données:", err);
        return res.status(500).json({ message: "Erreur serveur" });
      }
      
      if (results.length === 0) {
        return res.status(400).json({ message: "Token invalide ou expiré" });
      }
      
      const resetRecord = results[0];
      const userId = resetRecord.user_id;
      const userEmail = resetRecord.email;
      const userName = resetRecord.name;
      
      try {
        // Hachage du nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Utiliser une transaction
        db.beginTransaction((err) => {
          if (err) {
            return res.status(500).json({ message: "Erreur serveur" });
          }
          
          // Mettre à jour le mot de passe
          db.query(
            "UPDATE users SET password = ? WHERE id = ?",
            [hashedPassword, userId],
            (err, result) => {
              if (err) {
                return db.rollback(() => {
                  console.error("Erreur lors de la mise à jour du mot de passe:", err);
                  res.status(500).json({ message: "Erreur lors de la mise à jour du mot de passe" });
                });
              }
              
              // Marquer le token comme utilisé
              db.query(
                "UPDATE password_reset_tokens SET used = TRUE WHERE id = ?",
                [resetRecord.id],
                (err) => {
                  if (err) {
                    return db.rollback(() => {
                      console.error("Erreur lors du marquage du token:", err);
                      res.status(500).json({ message: "Erreur lors de la mise à jour" });
                    });
                  }
                  
                  // Envoyer un email de confirmation
                  const mailOptions = {
                    from: '"Bibliothèque Virtuelle" <sersif.a366@ucd.ac.ma>',
                    to: userEmail,
                    subject: 'Confirmation de réinitialisation de mot de passe',
                    html: `
                      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                        <h1 style="color: #3a416f; text-align: center;">Mot de passe réinitialisé</h1>
                        <p>Bonjour ${userName},</p>
                        <p>Votre mot de passe a été réinitialisé avec succès.</p>
                        <p>Si vous n'êtes pas à l'origine de cette action, veuillez contacter immédiatement notre service d'assistance.</p>
                        <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 10px;">
                          Cet email a été envoyé automatiquement, merci de ne pas y répondre.
                        </p>
                      </div>
                    `
                  };
                  
                  transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                      console.error("Erreur d'envoi d'email de confirmation:", error);
                      // Continuer malgré l'erreur d'envoi
                    } else {
                      console.log('Email de confirmation envoyé: ' + info.response);
                    }
                    
                    // Finaliser la transaction
                    db.commit((err) => {
                      if (err) {
                        return db.rollback(() => {
                          console.error("Erreur lors de la validation de la transaction:", err);
                          res.status(500).json({ message: "Erreur serveur" });
                        });
                      }
                      
                      res.json({ message: "Mot de passe réinitialisé avec succès" });
                    });
                  });
                }
              );
            }
          );
        });
      } catch (error) {
        console.error("Erreur de hachage:", error);
        res.status(500).json({ message: "Erreur serveur" });
      }
    }
  );
});

// Vérifier la validité d'un token
router.get("/verify-token/:token", (req, res) => {
  const token = req.params.token;
  
  if (!token) {
    return res.status(400).json({ valid: false, message: "Token requis" });
  }
  
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
  db.query(
    "SELECT * FROM password_reset_tokens WHERE token = ? AND expires_at > NOW() AND used = FALSE",
    [hashedToken],
    (err, results) => {
      if (err) {
        console.error("Erreur de base de données:", err);
        return res.status(500).json({ valid: false, message: "Erreur serveur" });
      }
      
      if (results.length === 0) {
        return res.json({ valid: false, message: "Token invalide ou expiré" });
      }
      
      res.json({ valid: true, message: "Token valide" });
    }
  );
});

// Nettoyage périodique des tokens expirés
const cleanupExpiredTokens = () => {
  db.query(
    "DELETE FROM password_reset_tokens WHERE expires_at < NOW()",
    (err, result) => {
      if (err) {
        console.error("Erreur lors du nettoyage des tokens expirés:", err);
      } else if (result.affectedRows > 0) {
        console.log(`${result.affectedRows} tokens expirés supprimés`);
      }
    }
  );
};

// Exécuter le nettoyage au démarrage et toutes les 24 heures
cleanupExpiredTokens();
setInterval(cleanupExpiredTokens, 24 * 60 * 60 * 1000);

module.exports = router;