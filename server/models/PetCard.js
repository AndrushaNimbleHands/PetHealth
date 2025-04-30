const mongoose = require('mongoose');

const petCardSchema = new mongoose.Schema({
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PetCard', petCardSchema);
