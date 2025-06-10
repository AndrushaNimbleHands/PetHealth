const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const petCardClientController = require('../controllers/petCardClientController');
const appointmentClientController = require('../controllers/appointmentClientController');

router.get('/petcards/mine', auth, petCardClientController.getMyPetCards);
router.get('/petcards/mine/:id', auth, petCardClientController.getMyPetCardById);
router.get('/appointments/:petId', auth, appointmentClientController.getByPetId);
router.patch('/appointments/:id/cancel', auth, appointmentClientController.cancelAppointment);

module.exports = router;
