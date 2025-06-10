const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middlewares/auth');
const PetCard = require("../models/PetCard");
const Code = require("../models/Code");
const transporter = require("../utils/mailer");

router.put('/user/me', authMiddleware, async (req, res) => {
    const {firstName, lastName, birthday} = req.body;
    try {
        const updated = await User.findByIdAndUpdate(
            req.user.id,
            {firstName, lastName, birthday},
            {new: true}
        );
        res.json({success: true, updated});
    } catch (e) {
        console.error('Update error:', e);
        res.status(500).json({error: 'Internal server error'});
    }
});

router.get('/user/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('firstName lastName birthday email phone');
        if (!user) return res.status(404).json({error: 'User not found'});
        res.json(user);
    } catch (e) {
        console.error('Get user error:', e);
        res.status(500).json({error: 'Internal server error'});
    }
});


router.put('/user/account', authMiddleware, async (req, res) => {
    const { email, phone } = req.body;
    if (email && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Зміна email дозволена лише адміністраторам' });
    }

    try {
        const updateData = {};
        if (req.user.role === 'admin' && email) {
            updateData.email = email;
        }
        if (phone) {
            updateData.phone = phone;
        }

        const updated = await User.findByIdAndUpdate(req.user.id, updateData, { new: true });
        res.json({ success: true, updated });
    } catch (e) {
        console.error('Update error:', e);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/user/send-phone-code', authMiddleware, async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({error: 'Користувача не знайдено'});

    const {newPhone} = req.body;
    if (!newPhone) return res.status(400).json({error: 'Номер телефону не вказано'});

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 хв

    await Code.create({email: user.email, code, expiresAt});

    await transporter.sendMail({
        from: `PetHealth <${process.env.EMAIL}>`,
        to: user.email,
        subject: 'Код підтвердження зміни номера телефону',
        text: `Ваш код підтвердження зміни номера телефону: ${code}. Дійсний 5 хвилин.`
    });

    res.json({message: 'Код підтвердження надіслано на email'});
});
router.post('/user/confirm-phone-change', authMiddleware, async (req, res) => {
    const {code, newPhone} = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({error: 'Користувача не знайдено'});

    const record = await Code.findOne({email: user.email, code, expiresAt: {$gt: new Date()}});
    if (!record) return res.status(400).json({error: 'Невірний код або час дії минув'});

    user.phone = newPhone;
    await user.save();
    await Code.deleteOne({_id: record._id});

    res.json({message: 'Номер телефону успішно змінено'});
});

router.get('/user/pets', authMiddleware, async (req, res) => {
    try {
        const pets = await PetCard.find({ownerId: req.user.id});
        res.json(pets);
    } catch (e) {
        console.error('Get pets error:', e);
        res.status(500).json({error: 'Internal server error'});
    }
});


router.put('/user/pet-card', authMiddleware, async (req, res) => {
    try {
        const {name, breed, birthday, speciesId} = req.body;

        const updated = await PetCard.findOneAndUpdate(
            {ownerId: req.user.id},
            {name, breed, birthday, speciesId: speciesId},
            {new: true}
        );

        if (!updated) {
            return res.status(404).json({error: 'Pet not found or not yours'});
        }

        res.json({success: true, pet: updated});
    } catch (e) {
        console.error('PetCard update error:', e);
        res.status(500).json({error: 'Internal server error'});
    }
});
router.post('/user/pet-card', authMiddleware, async (req, res) => {
    try {
        const {name, breed, birthday, speciesId} = req.body;

        await PetCard.create(
            {name, breed, birthday, speciesId: speciesId, ownerId: req.user.id},
        );
    } catch (e) {
        console.error('PetCard create error:', e);
        res.status(500).json({error: 'Internal server error'});
    }
    res.json({success: true, message: 'Pet created successfully'});
});

router.delete('/pet-card/:id', authMiddleware, async (req, res) => {
    const petId = req.params.id;

    try {
        console.log('Trying to delete pet with id:', petId, 'for user:', req.user.id);

        const deleted = await PetCard.findOneAndDelete({
            _id: petId
        });

        if (!deleted) {
            return res.status(404).json({error: 'Pet not found or not yours'});
        }

        res.json({success: true, message: 'Pet deleted successfully'});
    } catch (e) {
        console.error('PetCard delete error:', e);
        res.status(500).json({error: 'Internal server error'});
    }
});

module.exports = router;