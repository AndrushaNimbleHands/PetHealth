const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    shortDescription: { type: String },
    longDescription: { type: String },
    speciesId: { type: mongoose.Schema.Types.ObjectId, ref: 'Species', default: null }, // null = універсальний
    isPrescriptionFree: { type: Boolean, default: false },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    unit: { type: String, required: true }, 
    stock: { type: Number, default: 0 },
    price: { type: Number, required: true },
    isArchived: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
