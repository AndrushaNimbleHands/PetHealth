const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const adminOrDoctor = require('../middlewares/adminOrDoctor');
const appointmentController = require('../controllers/appointmentController');

router.get('/slots', auth, appointmentController.getAvailableSlots);
router.post('/', auth, appointmentController.createAppointment);

router.get('/admin', auth, adminOrDoctor, appointmentController.getAllAdmin);
router.post('/admin', auth, adminOrDoctor, appointmentController.createByAdmin);
router.patch('/:id/archive', auth, adminOrDoctor, appointmentController.archive);
router.get('/by-pet/:petId', auth, adminOrDoctor, appointmentController.getByPet);
router.patch('/:id/restore', auth, adminOrDoctor, appointmentController.restore);
router.patch('/:id', auth, adminOrDoctor, appointmentController.update);
router.delete('/:id', auth, adminOrDoctor, appointmentController.remove);


module.exports = router;
