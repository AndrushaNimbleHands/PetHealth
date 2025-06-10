const PetCard = require('../models/PetCard');
const auth = require("../middlewares/auth");
const User = require("../models/User");

exports.getAll = async (req, res) => {
    try {
        const {archived, species, owner} = req.query;
        const filter = {};
        if (archived !== undefined) filter.isArchived = archived === 'true';
        if (species) filter.speciesId = species;
        if (owner) filter.ownerId = owner;

        const cards = await PetCard.find(filter)
            .populate({path: 'ownerId', model: 'User', select: 'id firstName lastName email phone'})
            .populate({path: 'speciesId', model: 'Species', select: 'id name'});

        res.json(cards);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
};

exports.getOne = async (req, res) => {
    try {
        const card = await PetCard.findById(req.params.id)
            .populate({path: 'ownerId', model: 'User', select: 'id firstName lastName email phone'})
            .populate({path: 'speciesId', model: 'Species', select: 'id name'});
        if (!card) return res.status(404).json({error: 'Картку не знайдено'});
        res.json(card);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
};

exports.archive = async (req, res) => {
    console.log('📩 archive запит на ID:', req.params.id);
    try {
        await PetCard.findByIdAndUpdate(req.params.id, {isArchived: true});
        res.json({success: true});
    } catch (e) {
        res.status(500).json({error: e.message});
    }
};

exports.restore = async (req, res) => {
    try {
        const result = await PetCard.findByIdAndUpdate(req.params.id, {isArchived: false});
        if (!result) return res.status(404).json({error: 'Картку не знайдено'});
        res.json({success: true});
    } catch (e) {
        res.status(500).json({error: e.message});
    }
};

exports.remove = async (req, res) => {
    try {
        const result = await PetCard.findByIdAndDelete(req.params.id);
        if (!result) return res.status(404).json({error: 'Картку не знайдено'});
        res.json({success: true});
    } catch (e) {
        res.status(500).json({error: e.message});
    }
};


exports.update = async (req, res) => {
    try {
        const {name, speciesId, breed, ownerId, birthday} = req.body;

        const updated = await PetCard.findByIdAndUpdate(
            req.params.id,
            {name, speciesId, breed, ownerId, birthday},
            {new: true}
        );

        res.json(updated);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
};

exports.getClients = async (req, res) => {
    try {
        // role: 'client',
        const clients = await User.find({isArchived: false}).select('_id firstName lastName');
        console.log('Клієнти з бази:', clients);
        const formatted = clients.map(d => ({
            _id: d.id,
            name: `${d.firstName} ${d.lastName}`
        }));
        res.json(formatted);
    } catch (e) {
        console.error('GET /petcards/users error:', e);
        res.status(500).json({error: 'Internal server error'});
    }
};

exports.getMine = async (req, res) => {
    try {
        const pets = await PetCard.find({ownerId: req.user.id, isArchived: false})
            .populate('speciesId', 'name'); // якщо потрібно
        res.json(pets);
    } catch (err) {
        res.status(500).json({message: 'Помилка при отриманні тварин'});
    }
};

exports.create = async (req, res) => {
    try {
        const {name, speciesId, breed, birthday, ownerId} = req.body;

        if (!name || !speciesId || !ownerId) {
            return res.status(400).json({message: 'Поля "name", "speciesId" та "ownerId" є обовʼязковими.'});
        }

        const newCard = new PetCard({
            name,
            speciesId,
            breed,
            birthday,
            ownerId
        });

        await newCard.save();
        res.status(201).json(newCard);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};
