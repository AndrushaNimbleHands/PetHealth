const Appointment = require('../models/Appointment');

exports.getByPetId = async (req, res) => {
    try {
        const petId = req.params.petId;
        const userId = req.user.id;

        const appointments = await Appointment.find({
            petId,
            status: { $in: ['scheduled', 'in_progress', 'completed', 'cancelled'] },
        })
            .populate('procedureId')
            .populate('procedureId.doctor', 'firstName lastName')
            .populate('petId', 'ownerId');


        const filtered = appointments.filter(appt => appt?.petId?.ownerId?.toString() === userId);

        res.json(filtered);
    } catch (err) {
        res.status(500).json({message: 'Помилка при отриманні прийомів'});
    }
};

exports.cancelAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({message: 'Прийом не знайдено'});
        if (appointment.status !== 'scheduled') return res.status(400).json({message: 'Прийом не можна скасувати'});
        if (appointment.userId.toString() !== req.user.id) return res.status(403).json({message: 'Немає доступу'});

        const now = new Date();
        const appointmentDateTime = new Date(`${appointment.date}T${appointment.startTime}`);

        const diffInMs = appointmentDateTime - now;
        const diffInHours = diffInMs / (1000 * 60 * 60);
        if (diffInHours < 12) return res.status(400).json({message: 'Скасування можливе лише за 12 годин до прийому'});

        appointment.status = 'cancelled';
        await appointment.save();
        res.json({message: 'Прийом скасовано'});
    } catch (err) {
        res.status(500).json({message: 'Помилка при скасуванні прийому'});
    }
};
