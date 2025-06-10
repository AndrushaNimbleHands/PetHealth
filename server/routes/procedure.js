const express = require('express');
const router = express.Router();
const Procedure = require('../models/Procedure');
const auth = require('../middlewares/auth');
const adminOrDoctor = require('../middlewares/adminOrDoctor');
const User = require("../models/User");

router.get('/', auth, async (req, res) => {
    try {
        const list = await Procedure.find({ archived: false })
            .populate('doctor', 'name')
            .populate('species', 'name');
        res.json(list);
    } catch (err) {
        console.error('GET /procedures', err);
        res.status(500).json({ message: 'Помилка отримання процедур' });
    }
});

router.get('/archive', auth, adminOrDoctor, async (req, res) => {
    try {
        const list = await Procedure.find({ archived: true })
            .populate('doctor', 'name')
            .populate('species', 'name');
        res.json(list);
    } catch (err) {
        console.error('GET /procedures/archive', err);
        res.status(500).json({ message: 'Помилка отримання архіву' });
    }
});

router.post('/', auth, adminOrDoctor, async (req, res) => {
    try {
        const newProc = new Procedure(req.body);
        await newProc.save();
        res.status(201).json(newProc);
    } catch (err) {
        console.error('POST /procedures', err);
        res.status(400).json({ message: 'Не вдалося створити процедуру' });
    }
});

router.put('/:id', auth, adminOrDoctor, async (req, res) => {
    try {
        const updated = await Procedure.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        console.error('PUT /procedures/:id', err);
        res.status(400).json({ message: 'Помилка при оновленні процедури' });
    }
});

router.post('/:id/archive', auth, adminOrDoctor, async (req, res) => {
    try {
        const updated = await Procedure.findByIdAndUpdate(req.params.id, {
            archived: true,
            archivedAt: new Date()
        }, { new: true });
        res.json(updated);
    } catch (err) {
        console.error('ARCHIVE /procedures/:id', err);
        res.status(400).json({ message: 'Помилка при архівації' });
    }
});

router.post('/:id/restore', auth, adminOrDoctor, async (req, res) => {
    try {
        const updated = await Procedure.findByIdAndUpdate(req.params.id, {
            archived: false,
            archivedAt: null
        }, { new: true });
        res.json(updated);
    } catch (err) {
        console.error('RESTORE /procedures/:id', err);
        res.status(400).json({ message: 'Помилка при відновленні процедури' });
    }
});

router.delete('/:id', auth, adminOrDoctor, async (req, res) => {
    try {
        await Procedure.findByIdAndDelete(req.params.id);
        res.sendStatus(204);
    } catch (err) {
        console.error('DELETE /procedures/:id', err);
        res.status(400).json({ message: 'Помилка видалення процедури' });
    }
});

router.get('/doctors', auth, async (req, res) => {
    try {
        const doctors = await User.find({ role: 'doctor', isArchived: false }).select('_id firstName lastName');
        const formatted = doctors.map(d => ({
            _id: d._id,
            name: `${d.firstName} ${d.lastName}`
        }));
        res.json(formatted);
    } catch (e) {
        console.error('GET /procedures/doctors error:', e);
        res.status(500).json({ error: 'Internal server error' });
    }
});




module.exports = router;
