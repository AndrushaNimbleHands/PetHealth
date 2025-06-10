const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number
    }],

    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    total: Number,
    delivery: {
        method: {
            type: String,
            enum: ['pickup', 'np_branch', 'np_postomat', 'np_courier'],
            required: true
        },
        city: { type: String },
        branch: { type: String },
        postomat: { type: String },
        address: { type: String }
    },

    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'cod'],
        default: 'cash'
    },
    status: {
        type: String,
        enum: ['pending', 'shipping', 'completed', 'cancelled'],
        default: 'pending'
    },

    createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Order', orderSchema);
