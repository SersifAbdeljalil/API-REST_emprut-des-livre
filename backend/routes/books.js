const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const db = require("../config/db");
const multer = require("multer");
const path = require("path");

// Configuration de multer pour l'upload d'images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Nom unique pour chaque fichier
    }
});

const upload = multer({ storage: storage });

// Obtenir tous les livres
router.get("/", (req, res) => {
    console.log("Route GET /api/books atteinte");
    db.query("SELECT * FROM books", (err, results) => {
        if (err) {
            console.error("Erreur lors de la récupération des livres:", err);
            return res.status(500).json({ message: "Erreur lors de la récupération des livres" });
        }
        res.json(results);
    });
});

// Ajouter un livre avec une image
router.post("/", upload.single('image'), (req, res) => {
    const { title, author, description } = req.body;
    const imageUrl = req.file ? req.file.path : null; // Chemin de l'image uploadée

    const query = "INSERT INTO books (title, author, description, image_url) VALUES (?, ?, ?, ?)";
    
    db.query(query, [title, author, description, imageUrl], (err, result) => {
        if (err) {
            console.error("Erreur lors de l'ajout du livre:", err);
            return res.status(500).json({ message: "Erreur lors de l'ajout du livre" });
        }
        res.status(201).json({ message: "Livre ajouté avec succès", id: result.insertId });
    });
});

// Modifier un livre avec une image
router.put("/:id", upload.single('image'), (req, res) => {
    const { title, author, description } = req.body;
    const imageUrl = req.file ? req.file.path : null; // Chemin de l'image uploadée

    const query = "UPDATE books SET title = ?, author = ?, description = ?, image_url = ? WHERE id = ?";
    
    db.query(query, [title, author, description, imageUrl, req.params.id], (err, result) => {
        if (err) {
            console.error("Erreur lors de la modification du livre:", err);
            return res.status(500).json({ message: "Erreur lors de la modification du livre" });
        }
        res.json({ message: "Livre modifié avec succès" });
    });
});

// Supprimer un livre
router.delete("/:id", (req, res) => {
    db.query("DELETE FROM books WHERE id = ?", [req.params.id], (err, result) => {
        if (err) {
            console.error("Erreur lors de la suppression du livre:", err);
            return res.status(500).json({ message: "Erreur lors de la suppression du livre" });
        }
        res.json({ message: "Livre supprimé avec succès" });
    });
});

// Emprunter un livre
router.post("/:id/borrow", (req, res) => {
    const bookId = req.params.id;
    const userId = req.userId;

    db.query(
        "UPDATE books SET available = false, borrowed_by = ? WHERE id = ? AND available = true",
        [userId, bookId],
        (err, result) => {
            if (err) {
                console.error("Erreur lors de l'emprunt du livre:", err);
                return res.status(500).json({ message: "Erreur lors de l'emprunt du livre" });
            }
            if (result.affectedRows === 0) {
                return res.status(400).json({ message: "Livre non disponible" });
            }

            // Ajouter l'enregistrement dans la table borrows
            db.query(
                "INSERT INTO borrows (book_id, user_id) VALUES (?, ?)",
                [bookId, userId],
                (err) => {
                    if (err) {
                        console.error("Erreur lors de l'enregistrement de l'emprunt:", err);
                        return res.status(500).json({ message: "Erreur lors de l'enregistrement de l'emprunt" });
                    }
                    res.json({ message: "Livre emprunté avec succès" });
                }
            );
        }
    );
});

// Retourner un livre
router.post("/:id/return", (req, res) => {
    const bookId = req.params.id;
    const userId = req.userId;

    db.query(
        "UPDATE books SET available = true, borrowed_by = NULL WHERE id = ? AND borrowed_by = ?",
        [bookId, userId],
        (err, result) => {
            if (err) {
                console.error("Erreur lors du retour du livre:", err);
                return res.status(500).json({ message: "Erreur lors du retour du livre" });
            }
            if (result.affectedRows === 0) {
                return res.status(400).json({ message: "Opération non autorisée" });
            }

            // Mettre à jour la date de retour dans la table borrows
            db.query(
                "UPDATE borrows SET return_date = CURRENT_TIMESTAMP WHERE book_id = ? AND user_id = ? AND return_date IS NULL",
                [bookId, userId],
                (err) => {
                    if (err) {
                        console.error("Erreur lors de l'enregistrement du retour:", err);
                        return res.status(500).json({ message: "Erreur lors de l'enregistrement du retour" });
                    }
                    res.json({ message: "Livre retourné avec succès" });
                }
            );
        }
    );
});

module.exports = router;
