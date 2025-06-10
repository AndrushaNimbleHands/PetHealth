const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    petId: { type: mongoose.Schema.Types.ObjectId, ref: 'PetCard', required: true },
    procedureId: { type: mongoose.Schema.Types.ObjectId, ref: 'Procedure', required: true },
    recipeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', default: null },
    appointmentNumber: {
        type: String,
        required: true,
        unique: true
    },

    totalPrice: { type: Number},
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },

    comment: { type: String },

    status: {
        type: String,
        enum: ['scheduled', 'in_progress', 'cancelled', 'completed'],
        default: 'scheduled'
    },

    animalInfo: {
        weight: { type: Number },
        temperature: { type: Number },
        condition: { type: String }
    },
    diagnosis: { type: String },
    prescription: { type: String },
    isArchived: {
        type: Boolean,
        default: false
    },
    usedMedicines: [{
        medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true }
    }]
}, {
    timestamps: true
});

appointmentSchema.pre('save', async function (next) {
    if (!this.totalPrice) {
        const Procedure = mongoose.model('Procedure');
        const procedure = await Procedure.findById(this.procedureId);
        if (procedure) {
            this.totalPrice = procedure.price;
        }
    }
    next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);
