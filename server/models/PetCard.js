const mongoose = require('mongoose');

const PetCardSchema = new mongoose.Schema({
    name: { type: String, required: true },
    speciesId: { type: mongoose.Schema.Types.ObjectId, ref: 'Species' },
    breed: { type: String },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    birthday: { type: Date },
    createdAt: { type: Date, default: Date.now },
    isArchived: {
        type: Boolean,
        default: false
    },
});
module.exports = mongoose.model('PetCard', PetCardSchema);