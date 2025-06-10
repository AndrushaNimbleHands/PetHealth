const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true },
    phone: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    role: { type: String, enum: ['client', 'doctor', 'admin'], required: true, default: 'client' },
    firstName: { type: String, required: true, default: "Власник" },
    lastName: { type: String, required: true, default: "Хороший" },
    birthday: { type: Date, required: true, default: Date.now },
    isArchived: {
        type: Boolean,
        default: false
    },
});
module.exports = mongoose.model('User', UserSchema);