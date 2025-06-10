module.exports = function adminOrDoctor(req, res, next) {
    if (req.user?.role !== 'admin' && req.user?.role !== 'doctor') return res.status(403).json({ error: 'Access denied' });
    next();
};
