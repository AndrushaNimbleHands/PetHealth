const mongoose = require('mongoose');

const ProcedureSchema = new mongoose.Schema({
    name: { type: String, required: true },
    species: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Species' }],
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    price: { type: Number, required: true },
    selfBooking: { type: Boolean, default: false },
    duration: { type: Number, required: true },
    archived: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Procedure', ProcedureSchema);
