const express = require('express');
const router = express.Router();
const controller = require('../controllers/categoryController');
const auth = require('../middlewares/auth');
const adminOnly = require('../middlewares/adminOnly');

router.get('/', auth, adminOnly, controller.getAll);
router.post('/', auth, adminOnly, controller.create);
router.put('/:id', auth, adminOnly, controller.update);
router.delete('/:id', auth, adminOnly, controller.remove);

module.exports = router;
