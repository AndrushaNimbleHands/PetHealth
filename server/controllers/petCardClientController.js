const PetCard = require('../models/PetCard');

exports.getMyPetCards = async (req, res) => {
    try {
        const cards = await PetCard.find({
            ownerId: req.user.id,
            isArchived: false
        })
            .populate('speciesId', 'name')
            .populate('ownerId', 'firstName lastName');

        res.json(cards);
    } catch (err) {
        res.status(500).json({message: 'Помилка при завантаженні карток'});
    }
};

exports.getMyPetCardById = async (req, res) => {
    try {
        const card = await PetCard.findOne({
            _id: req.params.id,
            ownerId: req.user.id,
            isArchived: false
        })
            .populate('speciesId', 'name')
            .populate('ownerId', 'firstName lastName');

        if (!card) return res.status(404).json({message: 'Картка не знайдена'});
        res.json(card);
    } catch (err) {
        res.status(500).json({message: 'Помилка при завантаженні картки'});
    }
};
