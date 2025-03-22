const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const db = require("../config/db");

// Middleware pour vérifier si le livre est disponible
const checkBookAvailability = (req, res, next) => {
    const { bookId } = req.body;
    
    // Vérifier si le livre est déjà emprunté
    db.query(
        "SELECT COUNT(*) as borrowCount FROM borrows WHERE book_id = ? AND status IN ('borrowed', 'approved')",
        [bookId],
        (err, results) => {
            if (err) {
                console.error("Erreur lors de la vérification de disponibilité:", err);
                return res.status(500).json({ message: "Erreur serveur" });
            }
            
            if (results[0].borrowCount > 0) {
                return res.status(400).json({ message: "Ce livre n'est pas disponible actuellement" });
            }
            
            next();
        }
    );
};

// Créer une demande d'emprunt
router.post("/request", auth, checkBookAvailability, (req, res) => {
    const { bookId, userId } = req.body;

    console.log("Received request body:", req.body); // Log pour vérifier les données reçues

    // Vérifiez que bookId et userId sont bien définis
    if (!bookId || !userId) {
        return res.status(400).json({ message: "Il manque l'identifiant du livre ou de l'utilisateur" });
    }

    // Vérifiez si l'utilisateur a déjà une demande en cours pour ce livre
    db.query(
        "SELECT * FROM borrows WHERE user_id = ? AND book_id = ? AND status IN ('pending', 'approved', 'borrowed')",
        [userId, bookId],
        (err, results) => {
            if (err) {
                console.error("Erreur lors de la vérification des demandes existantes:", err);
                return res.status(500).json({ message: "Erreur serveur" });
            }

            if (results.length > 0) {
                return res.status(400).json({ 
                    message: "Vous avez déjà une demande en cours pour ce livre",
                    status: results[0].status
                });
            }

            // Créez la demande d'emprunt
            db.query(
                "INSERT INTO borrows (user_id, book_id, status) VALUES (?, ?, 'pending')",
                [userId, bookId],
                (err, result) => {
                    if (err) {
                        console.error("Erreur lors de la création de la demande:", err);
                        return res.status(500).json({ message: "Erreur lors de la création de la demande" });
                    }

                    res.status(201).json({ 
                        message: "Demande d'emprunt créée avec succès", 
                        id: result.insertId,
                        status: "pending"
                    });
                }
            );
        }
    );
});

// Obtenir le statut d'emprunt d'un livre pour un utilisateur
router.get("/status", auth, (req, res) => {
    const { bookId, userId } = req.query;
    
    if (!bookId || !userId) {
        return res.status(400).json({ message: "Il manque l'identifiant du livre ou de l'utilisateur" });
    }
    
    db.query(
        "SELECT * FROM borrows WHERE user_id = ? AND book_id = ? AND status IN ('pending', 'approved', 'borrowed') ORDER BY request_date DESC LIMIT 1",
        [userId, bookId],
        (err, results) => {
            if (err) {
                console.error("Erreur lors de la récupération du statut:", err);
                return res.status(500).json({ message: "Erreur serveur" });
            }
            
            if (results.length === 0) {
                return res.json({ status: null });
            }
            
            res.json({ status: results[0].status, borrowId: results[0].id });
        }
    );
});

// Liste des emprunts d'un utilisateur
router.get("/user/:userId", auth, (req, res) => {
    const userId = req.params.userId;
    
    // Vérifier que l'utilisateur demande ses propres emprunts
    if (req.user.id !== parseInt(userId) && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Accès non autorisé" });
    }
    
    db.query(
        `SELECT b.*, bk.title, bk.author, bk.image_url 
         FROM borrows b 
         JOIN books bk ON b.book_id = bk.id 
         WHERE b.user_id = ? 
         ORDER BY b.request_date DESC`,
        [userId],
        (err, results) => {
            if (err) {
                console.error("Erreur lors de la récupération des emprunts:", err);
                return res.status(500).json({ message: "Erreur serveur" });
            }
            
            const formattedResults = results.map(borrow => ({
                ...borrow,
                imageUrl: borrow.image_url ? `http://192.168.1.4:5000/${borrow.image_url.replace("\\", "/")}` : null
            }));
            
            res.json(formattedResults);
        }
    );
});

// Annuler une demande d'emprunt (par l'utilisateur)
router.post("/cancel", auth, (req, res) => {
    const { borrowId, userId } = req.body;
    
    // Vérifier que l'utilisateur annule sa propre demande
    if (req.user.id !== parseInt(userId) && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Accès non autorisé" });
    }
    
    db.query(
        "SELECT * FROM borrows WHERE id = ? AND user_id = ?",
        [borrowId, userId],
        (err, results) => {
            if (err) {
                console.error("Erreur lors de la vérification de la demande:", err);
                return res.status(500).json({ message: "Erreur serveur" });
            }
            
            if (results.length === 0) {
                return res.status(404).json({ message: "Demande non trouvée" });
            }
            
            if (results[0].status !== 'pending') {
                return res.status(400).json({ message: "Vous ne pouvez annuler que les demandes en attente" });
            }
            
            db.query(
                "DELETE FROM borrows WHERE id = ?",
                [borrowId],
                (err, result) => {
                    if (err) {
                        console.error("Erreur lors de l'annulation de la demande:", err);
                        return res.status(500).json({ message: "Erreur lors de l'annulation" });
                    }
                    
                    res.json({ message: "Demande annulée avec succès" });
                }
            );
        }
    );
});

// Retourner un livre
router.post("/return", auth, (req, res) => {
    const { bookId, userId } = req.body;
    
    db.query(
        "SELECT * FROM borrows WHERE book_id = ? AND user_id = ? AND status = 'borrowed'",
        [bookId, userId],
        (err, results) => {
            if (err) {
                console.error("Erreur lors de la vérification de l'emprunt:", err);
                return res.status(500).json({ message: "Erreur serveur" });
            }
            
            if (results.length === 0) {
                return res.status(404).json({ message: "Aucun emprunt actif trouvé pour ce livre" });
            }
            
            db.query(
                "UPDATE borrows SET status = 'returned', return_date = NOW() WHERE id = ?",
                [results[0].id],
                (err, result) => {
                    if (err) {
                        console.error("Erreur lors du retour du livre:", err);
                        return res.status(500).json({ message: "Erreur lors du retour" });
                    }
                    
                    res.json({ message: "Livre retourné avec succès" });
                }
            );
        }
    );
});

// ROUTES ADMIN

// Liste de toutes les demandes d'emprunt (admin)
router.get("/admin/all", [auth, admin], (req, res) => {
    db.query(
        `SELECT b.*, u.name, u.email, bk.title, bk.author, bk.image_url 
         FROM borrows b 
         JOIN users u ON b.user_id = u.id 
         JOIN books bk ON b.book_id = bk.id 
         ORDER BY b.request_date DESC`,
        (err, results) => {
            if (err) {
                console.error("Erreur lors de la récupération des demandes:", err);
                return res.status(500).json({ message: "Erreur serveur" });
            }
            
            const formattedResults = results.map(borrow => ({
                ...borrow,
                imageUrl: borrow.image_url ? `http://192.168.1.4:5000/${borrow.image_url.replace("\\", "/")}` : null
            }));
            
            res.json(formattedResults);
        }
    );
});

// Approuver une demande (admin)
router.post("/admin/approve", [auth, admin], (req, res) => {
    const { borrowId, notes } = req.body;
    
    db.query(
        "UPDATE borrows SET status = 'approved', approval_date = NOW(), admin_notes = ? WHERE id = ?",
        [notes || null, borrowId],
        (err, result) => {
            if (err) {
                console.error("Erreur lors de l'approbation:", err);
                return res.status(500).json({ message: "Erreur lors de l'approbation" });
            }
            
            res.json({ message: "Demande approuvée avec succès" });
        }
    );
});

// Rejeter une demande (admin)
router.post("/admin/reject", [auth, admin], (req, res) => {
    const { borrowId, notes } = req.body;
    
    db.query(
        "UPDATE borrows SET status = 'rejected', approval_date = NOW(), admin_notes = ? WHERE id = ?",
        [notes || null, borrowId],
        (err, result) => {
            if (err) {
                console.error("Erreur lors du rejet:", err);
                return res.status(500).json({ message: "Erreur lors du rejet" });
            }
            
            res.json({ message: "Demande rejetée avec succès" });
        }
    );
});

// Marquer un livre comme emprunté (admin)
router.post("/admin/confirm-borrow", [auth, admin], (req, res) => {
    const { borrowId } = req.body;
    
    db.query(
        "UPDATE borrows SET status = 'borrowed', borrow_date = NOW() WHERE id = ? AND status = 'approved'",
        [borrowId],
        (err, result) => {
            if (err) {
                console.error("Erreur lors de la confirmation de l'emprunt:", err);
                return res.status(500).json({ message: "Erreur lors de la confirmation" });
            }
            
            res.json({ message: "Emprunt confirmé avec succès" });
        }
    );
});

// Confirmer le retour d'un livre (admin)
router.post("/admin/confirm-return", [auth, admin], (req, res) => {
    const { borrowId, notes } = req.body;
    
    db.query(
        "UPDATE borrows SET status = 'returned', return_date = NOW(), admin_notes = CONCAT(IFNULL(admin_notes, ''), '\n', ?) WHERE id = ?",
        [notes || 'Retour confirmé', borrowId],
        (err, result) => {
            if (err) {
                console.error("Erreur lors de la confirmation du retour:", err);
                return res.status(500).json({ message: "Erreur lors de la confirmation" });
            }
            
            res.json({ message: "Retour confirmé avec succès" });
        }
    );
});

module.exports = router;