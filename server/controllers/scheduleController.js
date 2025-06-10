const Schedule = require('../models/Schedule');
const Appointment = require('../models/Appointment');
const Day = require('../models/Day');
const User = require('../models/User');
const transporter = require("../utils/mailer");

exports.cancelAppointmentsInClosedDays = async (req, res) => {
    try {
        const schedule = await Schedule.findOne().populate('weekSchedule');
        if (!schedule) return res.json({ updated: 0 });

        const closedDays = schedule.weekSchedule
            .filter(day => !day.isOpen)
            .map(day => day.day);

        const appointments = await Appointment.find({ status: 'scheduled' })
            .populate('userId')
            .populate('procedureId')
            .populate('petId');

        const toCancel = appointments.filter(a => {
            const day = new Date(a.date).toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
            return closedDays.includes(day);
        });

        for (const a of toCancel) {
            a.status = 'cancelled';
            await a.save();

            const petName = a.animalInfo?.petId?.name || 'ваш улюбленець';
            const userName = `${a.userId?.firstName || ''} ${a.userId?.lastName || ''}`.trim();
            const procedure = a.procedureId?.name || 'процедура';
            const dateStr = new Date(a.date).toLocaleDateString('uk-UA');

            if (a.userId?.email) {
                await transporter.sendMail({
                    from: `"PetHealth" <${process.env.EMAIL}>`,
                    to: a.userId.email,
                    subject: 'Ваш запис скасовано',
                    html: `
                        <p>Доброго дня${userName ? ', ' + userName : ''}!</p>
                        <p>Запис для <strong>${petName}</strong> на <strong>${procedure}</strong> 
                        <strong>${dateStr}</strong> з <strong>${a.startTime}</strong> по <strong>${a.endTime}</strong>
                        <strong>скасовано</strong>, оскільки клініка не працює в цей день.</p>
                        <p>Будь ласка, створіть новий запис або зв'яжіться з клінікою для уточнення деталей.</p>
                        <br/>
                        <p>З повагою,<br/>PetHealth</p>
                    `
                });
            }
        }

        res.json(toCancel);;
    } catch (err) {
        console.error("Помилка при скасуванні записів:", err);
        res.status(500).json({ message: 'Помилка скасування записів' });
    }
};



exports.updateSchedule = async (req, res) => {
    try {
        const { weekSchedule } = req.body;

        // Видалити старі дні (щоб не було сміття)
        const oldSchedule = await Schedule.findOne();
        if (oldSchedule && oldSchedule.weekSchedule?.length) {
            await Day.deleteMany({ _id: { $in: oldSchedule.weekSchedule } });
        }

        // Створити нові дні
        const newDays = await Day.insertMany(weekSchedule);
        const newIds = newDays.map(day => day._id);

        // Записати ID нових днів у Schedule
        let schedule = await Schedule.findOne();
        if (!schedule) {
            schedule = new Schedule({ weekSchedule: newIds });
        } else {
            schedule.weekSchedule = newIds;
        }
        await schedule.save();

        res.sendStatus(200);
    } catch (err) {
        console.error("Помилка при оновленні графіку:", err);
        res.status(500).json({ message: 'Не вдалося оновити графік' });
    }
};


exports.getSchedule = async (req, res) => {
    try {
        const schedule = await Schedule.findOne().populate('weekSchedule');
        if (!schedule) return res.json({ weekSchedule: [] });
        res.json(schedule);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getAppointmentsInClosedDays = async (req, res) => {
    try {
        const schedule = await Schedule.findOne().populate('weekSchedule');
        if (!schedule) return res.json([]);

        const closedDays = schedule.weekSchedule
            .filter(day => !day.isOpen)
            .map(day => day.day);

        const appointments = await Appointment.find()
            .populate({
                path: 'procedureId',
                select: 'name'
            });

        const badAppointments = appointments.filter(a => {
            const apptDay = new Date(a.date).toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
            return closedDays.includes(apptDay) && !a.isArchived;
        });

        res.json(badAppointments);
    } catch (err) {
        console.error("Помилка при перевірці записів у закриті дні:", err);
        res.status(500).json({ message: 'Не вдалося отримати записи' });
    }
};

