const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) {
        return res.status(401).json({ message: "Accès refusé, token manquant" });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = verified.id;  // Assurez-vous que l'ID utilisateur est inclus dans le token
        next();
    } catch (err) {
        res.status(400).json({ message: "Token invalide" });
    }
};
