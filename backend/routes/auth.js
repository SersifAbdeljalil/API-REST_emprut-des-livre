const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configuration de multer pour le téléchargement des images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../uploads/profiles");
    // Créer le répertoire s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Générer un nom de fichier unique basé sur l'horodatage et l'ID utilisateur
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "profile-" + uniqueSuffix + ext);
  },
});

// Filtrer les types de fichiers acceptés
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Seules les images sont autorisées"), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  }
});

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Accès refusé. Token requis." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token invalide ou expiré." });
    }
    req.user = user;
    next();
  });
};

// Middleware de vérification de rôle administrateur
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Accès refusé. Droits administrateur requis." });
  }
  next();
};

// Inscription
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Tous les champs sont requis" });
  }

  // Vérifier si l'email est déjà utilisé
  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) {
      console.error("Erreur de base de données:", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }

    try {
      // Hachage du mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insertion du nouvel utilisateur
      db.query(
        "INSERT INTO users (name, email, password, role, profile_image) VALUES (?, ?, ?, ?, ?)",
        [name, email, hashedPassword, "user", "https://via.placeholder.com/150"],
        (err, result) => {
          if (err) {
            console.error("Erreur lors de l'inscription:", err);
            return res.status(500).json({ message: "Erreur lors de l'inscription" });
          }
          res.status(201).json({ message: "Inscription réussie" });
        }
      );
    } catch (error) {
      console.error("Erreur de hachage:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });
});

// Connexion
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({ message: "Email et mot de passe requis" });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) {
      console.error("Erreur de base de données:", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    const user = results[0];

    try {
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return res.status(401).json({ message: "Email ou mot de passe incorrect" });
      }

      // Générer JWT
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Format de l'URL complète pour l'image de profil
      const baseUrl = process.env.API_URL || "http://localhost:3000";
      const profileImage = user.profile_image.startsWith("http") 
        ? user.profile_image 
        : `${baseUrl}/uploads/profiles/${user.profile_image}`;

      res.json({
        message: "Connexion réussie",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileImage: profileImage
        }
      });
    } catch (error) {
      console.error("Erreur d'authentification:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });
});

// Récupérer les informations de l'utilisateur connecté
router.get("/profile", authenticateToken, (req, res) => {
  db.query(
    "SELECT id, name, email, role, profile_image, created_at FROM users WHERE id = ?",
    [req.user.id],
    (err, results) => {
      if (err) {
        console.error("Erreur de base de données:", err);
        return res.status(500).json({ message: "Erreur serveur" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      const user = results[0];
      
      // Format de l'URL complète pour l'image de profil
      const baseUrl = process.env.API_URL || "http://localhost:3000";
      const profileImage = user.profile_image.startsWith("http") 
        ? user.profile_image 
        : `${baseUrl}/uploads/profiles/${user.profile_image}`;

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: profileImage,
        createdAt: user.created_at
      });
    }
  );
});

// Mettre à jour les informations de profil
router.put("/profile", authenticateToken, (req, res) => {
  const { name, email } = req.body;

  // Validation
  if (!name || !email) {
    return res.status(400).json({ message: "Nom et email requis" });
  }

  // Vérifier si l'email est déjà utilisé par un autre utilisateur
  db.query(
    "SELECT * FROM users WHERE email = ? AND id != ?",
    [email, req.user.id],
    (err, results) => {
      if (err) {
        console.error("Erreur de base de données:", err);
        return res.status(500).json({ message: "Erreur serveur" });
      }

      if (results.length > 0) {
        return res.status(400).json({ message: "Cet email est déjà utilisé" });
      }

      // Mettre à jour les informations
      db.query(
        "UPDATE users SET name = ?, email = ? WHERE id = ?",
        [name, email, req.user.id],
        (err, result) => {
          if (err) {
            console.error("Erreur lors de la mise à jour:", err);
            return res.status(500).json({ message: "Erreur lors de la mise à jour" });
          }
          
          if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
          }
          
          res.json({ message: "Profil mis à jour avec succès" });
        }
      );
    }
  );
});

// Mettre à jour le mot de passe
router.put("/password", authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Validation
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Tous les champs sont requis" });
  }

  // Vérifier le mot de passe actuel
  db.query(
    "SELECT password FROM users WHERE id = ?",
    [req.user.id],
    async (err, results) => {
      if (err) {
        console.error("Erreur de base de données:", err);
        return res.status(500).json({ message: "Erreur serveur" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      const user = results[0];

      try {
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        
        if (!isMatch) {
          return res.status(401).json({ message: "Mot de passe actuel incorrect" });
        }

        // Hachage du nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Mise à jour du mot de passe
        db.query(
          "UPDATE users SET password = ? WHERE id = ?",
          [hashedPassword, req.user.id],
          (err, result) => {
            if (err) {
              console.error("Erreur lors de la mise à jour:", err);
              return res.status(500).json({ message: "Erreur lors de la mise à jour" });
            }
            
            res.json({ message: "Mot de passe mis à jour avec succès" });
          }
        );
      } catch (error) {
        console.error("Erreur de hachage:", error);
        res.status(500).json({ message: "Erreur serveur" });
      }
    }
  );
});

// Mettre à jour l'image de profil avec un simple URL
router.put("/profile/image-url", authenticateToken, (req, res) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ message: "URL de l'image requise" });
  }

  db.query(
    "UPDATE users SET profile_image = ? WHERE id = ?",
    [imageUrl, req.user.id],
    (err, result) => {
      if (err) {
        console.error("Erreur lors de la mise à jour:", err);
        return res.status(500).json({ message: "Erreur lors de la mise à jour" });
      }
      
      res.json({ 
        message: "Image de profil mise à jour avec succès",
        profileImage: imageUrl 
      });
    }
  );
});

// Télécharger et mettre à jour l'image de profil
router.post(
  "/profile/image", 
  authenticateToken, 
  upload.single("profileImage"), 
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier téléchargé" });
    }

    const filename = req.file.filename;

    // Récupérer l'ancienne image pour la supprimer plus tard
    db.query(
      "SELECT profile_image FROM users WHERE id = ?",
      [req.user.id],
      (err, results) => {
        if (err) {
          console.error("Erreur de base de données:", err);
          return res.status(500).json({ message: "Erreur serveur" });
        }

        const oldImage = results[0]?.profile_image;

        // Mettre à jour avec la nouvelle image
        db.query(
          "UPDATE users SET profile_image = ? WHERE id = ?",
          [filename, req.user.id],
          async (err, result) => {
            if (err) {
              console.error("Erreur lors de la mise à jour:", err);
              return res.status(500).json({ message: "Erreur lors de la mise à jour" });
            }

            // Supprimer l'ancienne image si elle existe et n'est pas une URL externe
            if (oldImage && !oldImage.startsWith("http")) {
              const oldImagePath = path.join(__dirname, "../uploads/profiles", oldImage);
              
              // Vérifier si le fichier existe avant de le supprimer
              if (fs.existsSync(oldImagePath)) {
                try {
                  fs.unlinkSync(oldImagePath);
                } catch (error) {
                  console.error("Erreur lors de la suppression de l'ancienne image:", error);
                  // On continue malgré l'erreur
                }
              }
            }

            const baseUrl = process.env.API_URL || "http://localhost:3000";
            const profileImageUrl = `${baseUrl}/uploads/profiles/${filename}`;
            
            res.json({ 
              message: "Image de profil mise à jour avec succès",
              profileImage: profileImageUrl
            });
          }
        );
      }
    );
  }
);

// Vérifier la validité du token
router.get("/verify-token", authenticateToken, (req, res) => {
  res.json({ 
    valid: true, 
    user: { 
      id: req.user.id,
      role: req.user.role
    } 
  });
});

// Récupérer la liste des utilisateurs (admin uniquement)
router.get("/users", authenticateToken, isAdmin, (req, res) => {
  db.query(
    "SELECT id, name, email, role, profile_image, created_at FROM users",
    (err, results) => {
      if (err) {
        console.error("Erreur de base de données:", err);
        return res.status(500).json({ message: "Erreur serveur" });
      }

      // Formatage des URL d'images de profil
      const baseUrl = process.env.API_URL || "http://localhost:3000";
      const users = results.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profile_image.startsWith("http") 
          ? user.profile_image 
          : `${baseUrl}/uploads/profiles/${user.profile_image}`,
        createdAt: user.created_at
      }));

      res.json(users);
    }
  );
});

// Récupérer un utilisateur spécifique (admin uniquement)
router.get("/users/:id", authenticateToken, isAdmin, (req, res) => {
  const userId = req.params.id;

  db.query(
    "SELECT id, name, email, role, profile_image, created_at FROM users WHERE id = ?",
    [userId],
    (err, results) => {
      if (err) {
        console.error("Erreur de base de données:", err);
        return res.status(500).json({ message: "Erreur serveur" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      const user = results[0];
      
      // Format de l'URL complète pour l'image de profil
      const baseUrl = process.env.API_URL || "http://localhost:3000";
      const profileImage = user.profile_image.startsWith("http") 
        ? user.profile_image 
        : `${baseUrl}/uploads/profiles/${user.profile_image}`;

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: profileImage,
        createdAt: user.created_at
      });
    }
  );
});

// Mettre à jour un utilisateur (admin uniquement)
router.put("/users/:id", authenticateToken, isAdmin, (req, res) => {
  const userId = req.params.id;
  const { name, email, role } = req.body;

  // Validation
  if (!name || !email || !role) {
    return res.status(400).json({ message: "Tous les champs sont requis" });
  }

  // Vérifier si l'email est déjà utilisé par un autre utilisateur
  db.query(
    "SELECT * FROM users WHERE email = ? AND id != ?",
    [email, userId],
    (err, results) => {
      if (err) {
        console.error("Erreur de base de données:", err);
        return res.status(500).json({ message: "Erreur serveur" });
      }

      if (results.length > 0) {
        return res.status(400).json({ message: "Cet email est déjà utilisé" });
      }

      // Mettre à jour les informations
      db.query(
        "UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?",
        [name, email, role, userId],
        (err, result) => {
          if (err) {
            console.error("Erreur lors de la mise à jour:", err);
            return res.status(500).json({ message: "Erreur lors de la mise à jour" });
          }
          
          if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
          }
          
          res.json({ message: "Utilisateur mis à jour avec succès" });
        }
      );
    }
  );
});

// Supprimer un utilisateur (admin uniquement)
router.delete("/users/:id", authenticateToken, isAdmin, (req, res) => {
  const userId = req.params.id;

  // Empêcher la suppression de soi-même
  if (parseInt(userId) === req.user.id) {
    return res.status(400).json({ message: "Vous ne pouvez pas supprimer votre propre compte" });
  }

  // Récupérer d'abord les infos de l'utilisateur pour l'image de profil
  db.query(
    "SELECT profile_image FROM users WHERE id = ?",
    [userId],
    (err, results) => {
      if (err) {
        console.error("Erreur de base de données:", err);
        return res.status(500).json({ message: "Erreur serveur" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      const profileImage = results[0].profile_image;

      // Supprimer l'utilisateur
      db.query(
        "DELETE FROM users WHERE id = ?",
        [userId],
        (err, result) => {
          if (err) {
            console.error("Erreur lors de la suppression:", err);
            return res.status(500).json({ message: "Erreur lors de la suppression" });
          }
          
          // Supprimer l'image de profil si elle existe et n'est pas une URL externe
          if (profileImage && !profileImage.startsWith("http")) {
            const imagePath = path.join(__dirname, "../uploads/profiles", profileImage);
            
            if (fs.existsSync(imagePath)) {
              try {
                fs.unlinkSync(imagePath);
              } catch (error) {
                console.error("Erreur lors de la suppression de l'image:", error);
                // On continue malgré l'erreur
              }
            }
          }
          
          res.json({ message: "Utilisateur supprimé avec succès" });
        }
      );
    }
  );
});

// Mot de passe oublié - Envoyer un lien de réinitialisation
// Note: Ceci est un exemple simplifié. Dans une application réelle, vous devriez
// envoyer un email avec un lien de réinitialisation temporaire.
router.post("/forgot-password", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email requis" });
  }

  db.query(
    "SELECT id FROM users WHERE email = ?",
    [email],
    (err, results) => {
      if (err) {
        console.error("Erreur de base de données:", err);
        return res.status(500).json({ message: "Erreur serveur" });
      }

      if (results.length === 0) {
        // Pour des raisons de sécurité, ne pas révéler si l'email existe ou non
        return res.json({ message: "Si votre email existe dans notre système, vous recevrez un lien de réinitialisation." });
      }

      const userId = results[0].id;
      
      // Générer un token de réinitialisation temporaire
      const resetToken = jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      
      // Dans une application réelle, vous enverriez un email avec ce token
      // Pour cet exemple, nous allons simplement retourner le token
      res.json({ 
        message: "Si votre email existe dans notre système, vous recevrez un lien de réinitialisation.",
        // Dans une application réelle, ne pas retourner le token dans la réponse
        resetToken: resetToken // À supprimer en production
      });
    }
  );
});

// Réinitialiser le mot de passe
router.post("/reset-password", (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: "Token et nouveau mot de passe requis" });
  }

  // Vérifier le token
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Token invalide ou expiré" });
    }

    try {
      // Hachage du nouveau mot de passe
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Mise à jour du mot de passe
      db.query(
        "UPDATE users SET password = ? WHERE id = ?",
        [hashedPassword, decoded.id],
        (err, result) => {
          if (err) {
            console.error("Erreur lors de la mise à jour:", err);
            return res.status(500).json({ message: "Erreur lors de la mise à jour" });
          }
          
          if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
          }
          
          res.json({ message: "Mot de passe réinitialisé avec succès" });
        }
      );
    } catch (error) {
      console.error("Erreur de hachage:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });
});

module.exports = router;