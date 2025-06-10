const mongoose = require('mongoose');
require('dotenv').config();

const Species = require('../models/Species');

const speciesList = [
    { name: 'Кіт' },
    { name: 'Собака' },
    { name: 'Хом’як' },
    { name: 'Кролик' },
    { name: 'Папуга' },
    { name: 'Черепаха' },
    { name: 'Рибка' }
];

async function insertSpecies() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ DB connected');

        const existing = await Species.find();
        if (existing.length > 0) {
            console.log('⚠️ Species already exist. Skipping insert.');
            return;
        }

        await Species.insertMany(speciesList);
        console.log('✅ Species added successfully');
    } catch (e) {
        console.error('❌ Error adding species:', e);
    } finally {
        await mongoose.disconnect();
    }
}

insertSpecies();
