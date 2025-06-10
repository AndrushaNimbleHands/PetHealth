const mongoose = require('mongoose');

const daySchema = new mongoose.Schema({
    day: { type: String, required: true },
    isOpen: { type: Boolean, default: true },
    workStart: { type: String, default: "09:00" },
    workEnd: { type: String, default: "17:00" },
    hasLunchBreak: { type: Boolean, default: false },
    lunchStart: { type: String, default: null },
    lunchEnd: { type: String, default: null },
    isSurgeryDay: { type: Boolean, default: false },
    surgeryStart: { type: String, default: null },
    surgeryEnd: { type: String, default: null }
});

module.exports = mongoose.model('Day', daySchema);