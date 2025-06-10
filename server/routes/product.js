const express = require('express');
const router = express.Router();
const controller = require('../controllers/productController');
const auth = require('../middlewares/auth');
const adminOnly = require('../middlewares/adminOnly');

router.get('/', auth, adminOnly, controller.getAll);
router.get('/:id', auth, adminOnly, controller.getById);
router.post('/', auth, adminOnly, controller.create);
router.put('/:id', auth, adminOnly, controller.update);
router.patch('/:id/archive', auth, adminOnly, controller.archive);
router.patch('/:id/restore', auth, adminOnly, controller.restore);
router.delete('/:id', auth, adminOnly, controller.remove);

module.exports = router;
