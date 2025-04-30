const mongoose = require('mongoose');

const petTypeSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('PetType', petTypeSchema);
