const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const adminOnly = require('../middlewares/adminOnly');
const adminOrderController = require('../controllers/adminOrderController');
router.get('/', auth, adminOnly, adminOrderController.getAllOrders);
router.patch('/:id', auth,  adminOnly, adminOrderController.updateOrder);

module.exports = router;
