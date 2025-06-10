const mailer = require('../utils/mailer');

const sendAppointmentReminderEmail = async (appointment, when) => {
    try {
        await appointment.populate([
            { path: 'userId', select: 'email firstName lastName' },
            { path: 'petId', select: 'name' },
            { path: 'procedureId', select: 'name' }
        ]);

        const subject = when === 'day'
            ? `Нагадування: Прийом завтра - №${appointment.appointmentNumber}`
            : `Нагадування: Прийом через годину - №${appointment.appointmentNumber}`;

        const html = `
      <h2>Нагадування про прийом</h2>
      <p>Привіт, ${appointment.userId.firstName}!</p>
      <p>Нагадуємо, що у вас запланований прийом:</p>
      <ul>
        <li><strong>Номер прийому:</strong> ${appointment.appointmentNumber}</li>
        <li><strong>Тварина:</strong> ${appointment.petId?.name || '—'}</li>
        <li><strong>Процедура:</strong> ${appointment.procedureId?.name || '—'}</li>
        <li><strong>Дата:</strong> ${new Date(appointment.date).toLocaleDateString('uk-UA')}</li>
        <li><strong>Час:</strong> ${appointment.startTime} – ${appointment.endTime}</li>
      </ul>
      <p>Будь ласка, будьте готові.</p>
    `;

        await mailer.sendMail({
            from: `"PetHealth" <${process.env.EMAIL}>`,
            to: appointment.userId.email,
            subject,
            html
        });
    } catch (e) {
        console.error('Помилка при надсиланні нагадування:', e.message);
    }
};

module.exports = { sendAppointmentReminderEmail };
