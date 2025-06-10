const authMiddleware = require("../middlewares/auth");
const Species = require("../models/Species");
const express = require("express");
const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
    try {
        const speciesList = await Species.find();
        res.json(speciesList);
    } catch (error) {
        console.error('Species fetch error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;