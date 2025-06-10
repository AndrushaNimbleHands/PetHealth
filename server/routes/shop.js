const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const auth = require('../middlewares/auth');

router.get('/products', shopController.getProducts);
router.get('/categories', shopController.getCategories);
router.get('/species', shopController.getSpecies);
router.post('/order', auth, shopController.createOrder);
router.get('/orders', auth, shopController.getUserOrders);



module.exports = router;
