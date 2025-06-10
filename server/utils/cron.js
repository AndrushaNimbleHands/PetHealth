const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const Order = require('../models/Order');
const { sendAppointmentReminderEmail } = require('./emailService');

cron.schedule('0 4 * * *', async () => {  // щоденно о 4:00 ранку
    try {
        const result = await Appointment.updateMany(
            { status: 'cancelled', isArchived: { $ne: true } },
            { $set: { isArchived: true } }
        );
        console.log(`[CRON] Архівовано ${result.modifiedCount} скасованих прийомів`);
    } catch (err) {
        console.error('[CRON] Помилка архівації скасованих прийомів:', err);
    }
});

cron.schedule('0 4 * * *', async () => {  // щоденно о 4:00 ранку
    try {
        const result = await Order.updateMany(
            { status: 'cancelled', isArchived: { $ne: true } },
            { $set: { isArchived: true } }
        );
        console.log(`[CRON] Архівовано ${result.modifiedCount} скасованих замовлень`);
    } catch (err) {
        console.error('[CRON] Помилка архівації скасованих замовлень:', err);
    }
});

cron.schedule('0 8 * * *', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const appointments = await Appointment.find({
        date: dateStr,
        status: 'scheduled',
        isArchived: false
    });

    for (const appt of appointments) {
        await sendAppointmentReminderEmail(appt, 'day');
    }
});

cron.schedule('*/10 * * * *', async () => {
    const now = new Date();
    const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);
    const dateStr = inOneHour.toISOString().split('T')[0];
    const hourStr = inOneHour.toTimeString().slice(0, 5); // HH:MM

    const appointments = await Appointment.find({
        date: dateStr,
        startTime: hourStr,
        status: 'scheduled',
        isArchived: false
    });

    for (const appt of appointments) {
        await sendAppointmentReminderEmail(appt, 'hour');
    }
});
