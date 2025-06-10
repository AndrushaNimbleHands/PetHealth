const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    weekSchedule: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Day' }],
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Schedule', scheduleSchema);
