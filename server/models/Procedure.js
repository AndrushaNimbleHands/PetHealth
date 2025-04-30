const mongoose = require('mongoose');

const procedureSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String }
});

module.exports = mongoose.model('Procedure', procedureSchema);
