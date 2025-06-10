const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/send-code', authController.sendCode);
router.post('/send-code-signin', authController.sendCodeSignIn);
router.post('/signup', authController.signup);
router.post('/signin', authController.signin);

module.exports = router;
