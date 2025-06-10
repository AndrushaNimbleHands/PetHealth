const express = require('express');
const router = express.Router();
const petCardsController = require ("../controllers/petCardsController");
const auth = require('../middlewares/auth');
const adminOrDoctor = require('../middlewares/adminOrDoctor');
const adminOnly = require('../middlewares/adminOnly');

router.get('/users', auth, adminOrDoctor, petCardsController.getClients);
router.get('/mine', auth, petCardsController.getMine);
router.get('/', auth, adminOrDoctor, petCardsController.getAll);
router.post('/', auth, adminOnly, petCardsController.create);
router.patch('/:id/archive', auth, adminOrDoctor, petCardsController.archive);
router.patch('/:id/restore', auth, adminOrDoctor, petCardsController.restore);
router.delete('/:id', auth, adminOrDoctor, petCardsController.remove);
router.get('/:id', auth, adminOrDoctor, petCardsController.getOne);
router.patch('/:id', auth, adminOrDoctor, petCardsController.update);

module.exports = router;
