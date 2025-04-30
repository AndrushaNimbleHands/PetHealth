const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'PetOwner', required: true },
    name: { type: String, required: true },
    typeId: { type: mongoose.Schema.Types.ObjectId, ref: 'PetType', required: true },
    breed: { type: String },
    birthDate: { type: Date },
    cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'PetCard' }
});

module.exports = mongoose.model('Pet', petSchema);
