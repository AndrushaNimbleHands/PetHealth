const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'PetCard', required: true },
    datetime: { type: Date, required: true },
    status: {
        type: String,
        enum: ['planned', 'started', 'ended'],
        default: 'planned'
    },
    clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'VetClinic', required: true },
    procedureId: { type: mongoose.Schema.Types.ObjectId, ref: 'Procedure' },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    doctorComment: { type: String }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
