const mongoose = require('mongoose');

const petOwnerSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true }
});

module.exports = mongoose.model('PetOwner', petOwnerSchema);
