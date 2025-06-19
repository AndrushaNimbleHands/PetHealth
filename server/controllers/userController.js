const User = require('../models/User');
const PetCard = require('../models/PetCard');
const Appointment = require('../models/Appointment');
const Order = require('../models/Order');
const Procedure = require('../models/Procedure');

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


exports.restoreUser = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, { isArchived: false });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.archiveUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });

        if (user.role === 'admin')
            return res.status(403).json({ message: 'Архівування адміністратора заборонене' });

        if (user.role === 'client') {
            const hasPets = await PetCard.exists({ ownerId: user._id });
            const hasAppointments = await Appointment.exists({ userId: user._id });
            const hasOrders = await Order.exists({ userId: user._id });

            if (hasPets || hasAppointments || hasOrders) {
                return res.status(403).json({ message: 'Клієнта неможливо архівувати — повʼязано з тваринами, прийомами або замовленнями' });
            }
        }

        if (user.role === 'doctor') {
            const hasProcedures = await Procedure.exists({ doctor: user._id });
            if (hasProcedures) {
                return res.status(403).json({ message: 'Лікаря неможливо архівувати — привʼязані процедури' });
            }
        }

        user.isArchived = true;
        await user.save();
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });

        if (user.role === 'admin')
            return res.status(403).json({ message: 'Видалення адміністратора заборонене' });

        if (user.role === 'client') {
            const hasPets = await Pet.exists({ ownerId: user._id });
            const hasAppointments = await Appointment.exists({ userId: user._id });
            const hasOrders = await Order.exists({ userId: user._id });

            if (hasPets || hasAppointments || hasOrders) {
                return res.status(403).json({ message: 'Клієнта неможливо видалити — повʼязано з тваринами, прийомами або замовленнями' });
            }
        }

        if (user.role === 'doctor') {
            const hasProcedures = await Procedure.exists({ doctorId: user._id });
            if (hasProcedures) {
                return res.status(403).json({ message: 'Лікаря неможливо видалити — привʼязані процедури' });
            }
        }

        await user.deleteOne();
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, birthday, role } = req.body;
        const existingEmail = await User.findOne({ email });
        if (existingEmail) return res.status(400).json({ message: 'Користувач з таким email вже існує' });

        const existingPhone = await User.findOne({ phone });
        if (existingPhone) return res.status(400).json({ message: 'Користувач з таким номером телефону вже існує' });

        const newUser = new User({ firstName, lastName, email, phone, birthday, role });
        await newUser.save();

        res.status(201).json({ message: 'Користувача успішно створено' });
    } catch (err) {
        console.error('Помилка при створенні користувача:', err);
        res.status(500).json({ message: 'Помилка сервера при створенні користувача' });
    }
};
