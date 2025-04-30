const mongoose = require('mongoose');

const vetClinicSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    edrpou: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('VetClinic', vetClinicSchema);
