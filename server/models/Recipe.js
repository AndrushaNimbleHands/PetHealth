const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    recipeNumber: {
        type: String,
        required: true,
        unique: true
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    petId: { type: mongoose.Schema.Types.ObjectId, ref: 'PetCard', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true }
    }],
    issuedAt: { type: Date, default: Date.now },
    validUntil: { type: Date, required: true },
});

recipeSchema.pre('validate', async function(next) {
    if (!this.recipeNumber) {
        let unique = false;
        while (!unique) {
            const candidate = 'RCP-' + Date.now().toString().slice(-6) + Math.floor(100 + Math.random() * 900);
            const existing = await mongoose.model('Recipe').findOne({ recipeNumber: candidate });
            if (!existing) {
                this.recipeNumber = candidate;
                unique = true;
            }
        }
    }
    next();
});


module.exports = mongoose.model('Recipe', recipeSchema);
