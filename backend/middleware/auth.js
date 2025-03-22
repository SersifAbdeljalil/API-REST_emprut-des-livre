const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Aucun token fourni' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'votresecretpardefaut');
        req.user = decoded; // Ajoutez les informations de l'utilisateur à req.user

        console.log("Authenticated user:", req.user); // Log pour vérifier les informations de l'utilisateur

        next();
    } catch (error) {
        console.error('Erreur d\'authentification:', error);
        return res.status(401).json({ message: 'Token non valide' });
    }
};