const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: {
        type: String,
        enum: ['admin', 'doctor'],
        required: true
    },
    clinicId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic',
        required: true
    }
});

module.exports = mongoose.model('Admin', adminSchema);
