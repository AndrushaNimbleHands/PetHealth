const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const adminOnly = require('../middlewares/adminOnly');
const scheduleController = require('../controllers/ScheduleController');

router.get('/', auth, adminOnly, scheduleController.getSchedule);
router.put('/', auth, adminOnly, scheduleController.updateSchedule);
router.get('/appointments/in-closed-days', auth, adminOnly, scheduleController.getAppointmentsInClosedDays);
router.post('/appointments/notify-in-closed-days', auth, adminOnly, scheduleController.cancelAppointmentsInClosedDays);
module.exports = router;
