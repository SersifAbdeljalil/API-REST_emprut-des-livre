// middleware/admin.js
module.exports = (req, res, next) => {
    // Vérifier que req.user existe (middleware auth doit être exécuté avant)
    if (!req.user) {
        return res.status(401).json({ message: "Authentification requise" });
    }
    
    // Vérifier le rôle
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Accès réservé aux administrateurs" });
    }
    
    next();
};