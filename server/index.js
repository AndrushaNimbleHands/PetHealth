const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB error:', err));

app.get('/', (req, res) => {
    res.send('Backend працює');
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));