const jwt = require('jsonwebtoken');

module.exports = function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token missing' });

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        console.log(req.user);
        next();
    } catch (e) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};




