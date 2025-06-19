const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const adminOnly = require('../middlewares/adminOnly');
const userController = require("../controllers/userController");

router.get('/', auth, adminOnly, userController.getAllUsers);
router.post('/', auth, adminOnly, userController.createUser);
router.patch('/:id/archive', auth, adminOnly, userController.archiveUser);
router.patch('/:id/restore', auth, adminOnly, userController.restoreUser);
router.patch('/:id', auth, adminOnly, userController.updateUser);
router.delete('/:id', auth, adminOnly, userController.deleteUser);

module.exports = router;
