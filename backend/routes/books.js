const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const db = require("../config/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Création du dossier uploads s'il n'existe pas
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configuration de multer pour l'upload d'images et PDFs
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Création d'un nom de fichier unique avec le timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtre pour accepter uniquement les images et les PDFs
const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'image') {
        // Accepter seulement les images
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Le fichier doit être une image.'), false);
        }
    } else if (file.fieldname === 'pdf') {
        // Accepter seulement les PDFs
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Le fichier doit être un PDF.'), false);
        }
    } else {
        cb(null, false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // Limite de 10MB
});

// Middleware pour gérer plusieurs uploads
const uploadFields = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'pdf', maxCount: 1 }
]);

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

// Obtenir un livre spécifique par ID
router.get("/:id", (req, res) => {
    db.query("SELECT * FROM books WHERE id = ?", [req.params.id], (err, results) => {
        if (err) {
            console.error("Erreur lors de la récupération du livre:", err);
            return res.status(500).json({ message: "Erreur lors de la récupération du livre" });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Livre non trouvé" });
        }
        res.json(results[0]);
    });
});

// Ajouter un livre avec image et PDF
router.post("/", uploadFields, (req, res) => {
    const { title, author, description, publication_date, genre, location_era, quantity } = req.body;

    // Vérification des erreurs liées à l'upload des fichiers
    if (req.files && req.files.image && req.files.image.length === 0) {
        return res.status(400).json({ message: "Erreur lors de l'upload de l'image" });
    }
    if (req.files && req.files.pdf && req.files.pdf.length === 0) {
        return res.status(400).json({ message: "Erreur lors de l'upload du PDF" });
    }

    // Récupérer les chemins des fichiers uploadés
    const imageUrl = req.files.image ? req.files.image[0].path : null;
    const pdfUrl = req.files.pdf ? req.files.pdf[0].path : null;
    
    // Valider et convertir la quantité en nombre entier
    const bookQuantity = parseInt(quantity) || 1; // Valeur par défaut: 1 si non spécifié ou invalide

    const query = "INSERT INTO books (title, author, description, image_url, pdf_url, publication_date, genre, location_era, quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    db.query(query, [title, author, description, imageUrl, pdfUrl, publication_date, genre, location_era, bookQuantity], (err, result) => {
        if (err) {
            console.error("Erreur lors de l'ajout du livre:", err);
            return res.status(500).json({ message: "Erreur lors de l'ajout du livre" });
        }
        res.status(201).json({ message: "Livre ajouté avec succès", id: result.insertId });
    });
});

// Modifier un livre
router.put("/:id", uploadFields, (req, res) => {
    const { title, author, description, publication_date, genre, location_era, quantity } = req.body;
    
    // Commencer par récupérer le livre existant pour conserver les URLs existantes si pas de nouveaux fichiers
    db.query("SELECT image_url, pdf_url FROM books WHERE id = ?", [req.params.id], (err, results) => {
        if (err) {
            console.error("Erreur lors de la récupération du livre existant:", err);
            return res.status(500).json({ message: "Erreur lors de la modification du livre" });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ message: "Livre non trouvé" });
        }
        
        const existingBook = results[0];
        
        // Utiliser les nouveaux fichiers s'ils sont fournis, sinon conserver les anciens
        const imageUrl = req.files.image ? req.files.image[0].path : existingBook.image_url;
        const pdfUrl = req.files.pdf ? req.files.pdf[0].path : existingBook.pdf_url;
        
        // Valider et convertir la quantité en nombre entier
        const bookQuantity = parseInt(quantity) || 1; // Valeur par défaut: 1 si non spécifié ou invalide
        
        const query = "UPDATE books SET title = ?, author = ?, description = ?, image_url = ?, pdf_url = ?, publication_date = ?, genre = ?, location_era = ?, quantity = ? WHERE id = ?";
        
        db.query(query, [title, author, description, imageUrl, pdfUrl, publication_date, genre, location_era, bookQuantity, req.params.id], (err, result) => {
            if (err) {
                console.error("Erreur lors de la modification du livre:", err);
                return res.status(500).json({ message: "Erreur lors de la modification du livre" });
            }
            res.json({ message: "Livre modifié avec succès" });
        });
    });
});

// Supprimer un livre
router.delete("/:id", (req, res) => {
    // Récupérer d'abord les fichiers associés au livre pour pouvoir les supprimer
    db.query("SELECT image_url, pdf_url FROM books WHERE id = ?", [req.params.id], (err, results) => {
        if (err) {
            console.error("Erreur lors de la récupération des fichiers du livre:", err);
            return res.status(500).json({ message: "Erreur lors de la suppression du livre" });
        }
        
        // Supprimer le livre de la base de données
        db.query("DELETE FROM books WHERE id = ?", [req.params.id], (err, result) => {
            if (err) {
                console.error("Erreur lors de la suppression du livre:", err);
                return res.status(500).json({ message: "Erreur lors de la suppression du livre" });
            }
            
            // Si le livre est supprimé, tenter de supprimer les fichiers
            if (results.length > 0) {
                const book = results[0];
                
                // Supprimer l'image si elle existe
                if (book.image_url) {
                    try {
                        fs.unlinkSync(book.image_url);
                    } catch (error) {
                        console.error("Erreur lors de la suppression de l'image:", error);
                    }
                }
                
                // Supprimer le PDF s'il existe
                if (book.pdf_url) {
                    try {
                        fs.unlinkSync(book.pdf_url);
                    } catch (error) {
                        console.error("Erreur lors de la suppression du PDF:", error);
                    }
                }
            }
            
            res.json({ message: "Livre supprimé avec succès" });
        });
    });
});

// Route pour télécharger un PDF (route existante)
router.get("/:id/download-pdf", (req, res) => {
    db.query("SELECT pdf_url FROM books WHERE id = ?", [req.params.id], (err, results) => {
        if (err) {
            console.error("Erreur lors de la récupération du PDF:", err);
            return res.status(500).json({ message: "Erreur lors de la récupération du PDF" });
        }
        
        if (results.length === 0 || !results[0].pdf_url) {
            return res.status(404).json({ message: "PDF non trouvé" });
        }
        
        const pdfPath = results[0].pdf_url;
        res.download(pdfPath);
    });
});

// Nouvelle route pour correspondre à l'URL utilisée par l'application mobile
router.get("/:id/pdf", (req, res) => {
    console.log(`Demande de PDF pour le livre ID: ${req.params.id}`);
    
    db.query("SELECT pdf_url FROM books WHERE id = ?", [req.params.id], (err, results) => {
        if (err) {
            console.error("Erreur lors de la récupération du PDF:", err);
            return res.status(500).json({ message: "Erreur lors de la récupération du PDF" });
        }
        
        if (results.length === 0 || !results[0].pdf_url) {
            console.log(`PDF non trouvé pour le livre ID: ${req.params.id}`);
            return res.status(404).json({ message: "PDF non trouvé" });
        }
        
        const pdfPath = results[0].pdf_url;
        console.log(`Envoi du PDF depuis: ${pdfPath}`);
        
        // Vérifier si le fichier existe
        if (!fs.existsSync(pdfPath)) {
            console.error(`Fichier PDF introuvable sur le serveur: ${pdfPath}`);
            return res.status(404).json({ message: "Fichier PDF introuvable sur le serveur" });
        }
        
        res.download(pdfPath);
    });
});

module.exports = router;