const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
    try {
        const { role, archived } = req.query;
        const filter = {
            _id: { $ne: req.user.id }
        };
        if (role) filter.role = role;
        if (archived !== undefined) filter.isArchived = archived === 'true';
        const users = await User.find(filter);
        res.json(users);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, birthday, role } = req.body;
        await User.findByIdAndUpdate(req.params.id, {
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(email && { email }),
            ...(phone && { phone }),
            ...(birthday && { birthday }),
            ...(role && { role })
        });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};


exports.archiveUser = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, { isArchived: true });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.restoreUser = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, { isArchived: false });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
