const Appointment = require('../models/Appointment');
const Procedure = require('../models/Procedure');
const Schedule = require('../models/Schedule');
const redis = require('../utils/redisClient');
const { io } = require("../index");
const mailer = require('../utils/mailer');

const sendAppointmentEmail = async ({ appointment, type = 'created' }) => {
    try {
        await appointment.populate([
            { path: 'userId', select: 'email firstName lastName' },
            { path: 'petId', select: 'name' },
            {
                path: 'procedureId',
                populate: {
                    path: 'doctor',
                    select: 'firstName lastName price'
                }
            },
            {
                path: 'usedMedicines.medicineId',
                select: 'name price'
            }
        ]);

        // Функція форматування дати у вигляді "ДД.ММ.РРРР"
        const formatDate = (dateStr) => {
            const date = new Date(dateStr);
            return date.toLocaleDateString('uk-UA', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        };

        // Мапа статусів для зручності
        const statusMap = {
            scheduled: 'Заплановано',
            in_progress: 'В процесі',
            completed: 'Завершено',
            cancelled: 'Скасовано'
        };

        // Якщо статус скасовано — відправляємо спрощене повідомлення
        if (appointment.status === 'cancelled') {
            const subject = `Скасування прийому №${appointment.appointmentNumber}`;

            const html = `
                <h2>Прийом скасовано</h2>
                <p>Номер прийому: <strong>${appointment.appointmentNumber}</strong></p>
                <p>Тварина: <strong>${appointment.petId?.name || '—'}</strong></p>
                <p>Дата прийому: <strong>${formatDate(appointment.date)}</strong></p>
                <p>Час: <strong>${appointment.startTime} – ${appointment.endTime}</strong></p>
                <p>Статус: <strong>Скасовано</strong></p>
                <p>Якщо у вас є питання, будь ласка, зв'яжіться з клінікою.</p>
            `;

            await mailer.sendMail({
                from: `"PetHealth" <${process.env.EMAIL}>`,
                to: appointment.userId.email,
                subject,
                html
            });
            return;
        }

        // --- Повний лист для інших статусів ---

        const subject = type === 'created'
            ? `Підтвердження запису на прийом №${appointment.appointmentNumber}`
            : `Оновлення прийому №${appointment.appointmentNumber}`;

        const animalInfo = appointment.animalInfo || {};
        const hasMedicalData =
            appointment.diagnosis ||
            appointment.prescription ||
            animalInfo.condition ||
            (animalInfo.temperature !== null && animalInfo.temperature !== undefined) ||
            (animalInfo.weight !== null && animalInfo.weight !== undefined);

        const usedMedsTotal = appointment.usedMedicines?.reduce((sum, med) => {
            const price = med.medicineId?.price || 0;
            return sum + price * med.quantity;
        }, 0) || 0;

        const procedurePrice = appointment.procedureId?.price || 0;
        const totalPrice = procedurePrice + usedMedsTotal;

        let medicalHtml = '';
        if (hasMedicalData) {
            medicalHtml = `
                <hr>
                <h3>Медична інформація</h3>
                ${appointment.diagnosis ? `<p><strong>Діагноз:</strong> ${appointment.diagnosis}</p>` : ''}
                ${appointment.prescription ? `<p><strong>Призначення:</strong> ${appointment.prescription}</p>` : ''}
                ${animalInfo.condition ? `<p><strong>Стан тварини:</strong> ${animalInfo.condition}</p>` : ''}
                ${(animalInfo.temperature !== null && animalInfo.temperature !== undefined) ? `<p><strong>Температура:</strong> ${animalInfo.temperature} °C</p>` : ''}
                ${(animalInfo.weight !== null && animalInfo.weight !== undefined) ? `<p><strong>Вага:</strong> ${animalInfo.weight} кг</p>` : ''}
            `;
        }

        let usedMedsHtml = '';
        if (appointment.usedMedicines && appointment.usedMedicines.length > 0) {
            usedMedsHtml = `
                <hr>
                <h3>Використані медикаменти</h3>
                <table border="1" cellpadding="5" cellspacing="0">
                    <thead>
                        <tr>
                            <th>Назва</th>
                            <th>Кількість</th>
                            <th>Ціна за одиницю</th>
                            <th>Вартість</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${appointment.usedMedicines.map(med => `
                            <tr>
                                <td>${med.medicineId?.name || '—'}</td>
                                <td>${med.quantity}</td>
                                <td>${med.medicineId?.price || '—'} грн</td>
                                <td>${med.quantity * (med.medicineId?.price || 0)} грн</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }

        const html = `
            <h2>Інформація про прийом</h2>
            <p><strong>Номер прийому:</strong> ${appointment.appointmentNumber}</p>
            <p><strong>Статус:</strong> ${statusMap[appointment.status] || appointment.status}</p>
            <p><strong>Тварина:</strong> ${appointment.petId?.name || '—'}</p>
            <p><strong>Процедура:</strong> ${appointment.procedureId?.name || '—'}</p>
            <p><strong>Ціна процедури:</strong> ${procedurePrice} грн</p>
            <p><strong>Лікар:</strong> ${appointment.procedureId?.doctor?.firstName || ''} ${appointment.procedureId?.doctor?.lastName || ''}</p>
            <p><strong>Дата:</strong> ${formatDate(appointment.date)}</p>
            <p><strong>Час:</strong> ${appointment.startTime} – ${appointment.endTime}</p>
            ${appointment.comment ? `<p><strong>Коментар:</strong> ${appointment.comment}</p>` : ''}
            ${medicalHtml}
            ${usedMedsHtml}
            <hr>
            <h3>Загальна вартість прийому: ${totalPrice} грн</h3>
        `;

        await mailer.sendMail({
            from: `"PetHealth" <${process.env.EMAIL}>`,
            to: appointment.userId.email,
            subject,
            html
        });

    } catch (e) {
        console.error('Помилка при надсиланні email для прийому:', e.message);
    }
};

exports.getAvailableSlots = async (req, res) => {
    const { date, procedureId } = req.query;
    const selectedDay = new Date(date).toLocaleString('en-US', { weekday: 'long' }).toLowerCase();

    const schedule = await Schedule.findOne().populate('weekSchedule');
    if (!schedule) return res.status(404).json({ message: 'Графік не знайдено' });

    const daySettings = schedule.weekSchedule.find(d => d.day === selectedDay);
    if (!daySettings || !daySettings.isOpen) return res.json([]);

    const procedure = await Procedure.findById(procedureId);
    if (!procedure) return res.status(404).json({ message: 'Процедура не знайдена' });

    const duration = procedure.duration;

    const existingAppointments = await Appointment.find({
        date,
        status: { $in: ['scheduled', 'in_progress', 'completed'] }
    });

    const busyTimes = existingAppointments.map(a => ({ start: a.startTime, end: a.endTime }));

    const timeToMinutes = t => +t.split(":")[0] * 60 + +t.split(":")[1];
    const minutesToTime = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

    const slots = [];
    let cursor = timeToMinutes(daySettings.workStart);
    const end = timeToMinutes(daySettings.workEnd);

    const now = new Date();
    const isToday = date === now.toISOString().split('T')[0];

    while (cursor + duration <= end) {
        const slotStart = minutesToTime(cursor);
        const slotEnd = minutesToTime(cursor + duration);

        // Якщо дата сьогодні, пропускаємо слоти в минулому
        if (isToday) {
            const [hour, minute] = slotStart.split(':').map(Number);
            const slotDateTime = new Date(date);
            slotDateTime.setHours(hour, minute, 0, 0);
            if (slotDateTime <= now) {
                cursor += duration;
                continue;
            }
        }

        const overlaps = busyTimes.some(b =>
            timeToMinutes(b.start) < cursor + duration &&
            timeToMinutes(b.end) > cursor
        );

        const isLocked = await redis.get(`lock:${date}:${slotStart}`);

        if (!overlaps &&
            (!daySettings.hasLunchBreak ||
                slotEnd <= daySettings.lunchStart ||
                slotStart >= daySettings.lunchEnd) &&
            !isLocked) {
            slots.push({ start: slotStart, end: slotEnd });
        }

        cursor += duration;
    }

    res.json(slots);
};


exports.createAppointment = async (req, res) => {
    const session = await Appointment.startSession();
    try {
        await session.withTransaction(async () => {
            const { petId, procedureId, date, startTime, comment } = req.body;
            const userId = req.user.id;
            const lockKey = `lock:${date}:${startTime}`;

            const lock = await redis.set(lockKey, userId, { nx: true, px: 30000 });
            if (!lock) throw new Error("Цей слот уже заблокований іншим користувачем");

            const procedure = await Procedure.findById(procedureId);
            const duration = procedure.duration;

            const [h, m] = startTime.split(':').map(Number);
            const endTime = `${String(Math.floor((h * 60 + m + duration) / 60)).padStart(2, '0')}:${String((h * 60 + m + duration) % 60).padStart(2, '0')}`;

            const conflict = await Appointment.findOne({
                date,
                $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }]
            }).session(session);
            console.log('🔐 Lock result:', lock);
            console.log('⛔ Conflict result:', conflict);
            if (conflict) throw new Error("Слот уже зайнятий!");

            const appointmentNumber = await generateUniqueAppointmentNumber();

            const newAppointment = new Appointment({
                userId,
                petId,
                procedureId,
                appointmentNumber,
                date,
                startTime,
                endTime,
                comment: comment || '',
                status: 'scheduled',
                animalInfo: { weight: null, temperature: null, condition: '' },
                diagnosis: '',
                prescription: ''
            });

            await newAppointment.save({ session });

            if (!io) {
                console.error('❌ io is undefined — socket не підʼєднаний');
            } else {
                io.emit('appointment:created', { date, startTime, endTime });
                console.log('📡 io.emit успішно виконано');
            }
            res.status(201).json(newAppointment);

            await sendAppointmentEmail({ appointment: newAppointment, type: 'created' });
        });
    } catch (err) {
        res.status(409).json({ message: err.message });
    } finally {
        try {
            const { date, startTime } = req.body || {};
            if (date && startTime) {
                await redis.del(`lock:${date}:${startTime}`);
                console.log('🔓 Lock released');
            }
        } catch (cleanupErr) {
            console.error('❌ Failed to release Redis lock:', cleanupErr.message);
        }
    }
};

const generateUniqueAppointmentNumber = async () => {
    let unique = false;
    let number = '';
    while (!unique) {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(1000 + Math.random() * 9000);
        number = `APT-${timestamp}${random}`;
        const exists = await Appointment.findOne({ appointmentNumber: number });
        if (!exists) unique = true;
    }
    return number;
};

exports.getByPet = async (req, res) => {
    try {
        const appointments = await Appointment.find({ petId: req.params.petId })
            .populate({
                path: 'procedureId',
                populate: {
                    path: 'doctor',
                    model: 'User',
                    select: 'firstName lastName price'
                }
            })
            .populate({
                path: 'userId',
                select: 'firstName lastName role'
            })
            .sort({ date: -1, startTime: -1 });

        const formatted = appointments.map(a => ({
            _id: a._id,
            date: a.date,
            startTime: a.startTime,
            endTime: a.endTime,
            status: a.status,
            comment: a.comment,
            isArchived: a.isArchived,
            diagnosis: a.diagnosis,
            prescription: a.prescription,
            animalInfo: a.animalInfo || {},

            procedureId: a.procedureId ? {
                _id: a.procedureId._id,
                name: a.procedureId.name,
                duration: a.procedureId.duration,
                doctor: a.procedureId.doctor ? {
                    _id: a.procedureId.doctor._id,
                    firstName: a.procedureId.doctor.firstName,
                    lastName: a.procedureId.doctor.lastName
                } : null
            } : null,

            userId: a.userId ? {
                _id: a.userId._id,
                firstName: a.userId.firstName,
                lastName: a.userId.lastName,
                role: a.userId.role
            } : null,
        }));

        res.json(formatted);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

exports.archive = async (req, res) => {
    try {
        await Appointment.findByIdAndUpdate(req.params.id, { isArchived: true });
        res.sendStatus(204);
    } catch (err) {
        console.error('archive error:', err);
        res.status(500).json({ message: 'Не вдалося заархівувати' });
    }
};

exports.restore = async (req, res) => {
    try {
        await Appointment.findByIdAndUpdate(req.params.id, { isArchived: false });
        res.sendStatus(204);
    } catch (err) {
        console.error('restore error:', err);
        res.status(500).json({ message: 'Не вдалося відновити' });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            status,
            animalInfo,
            diagnosis,
            prescription,
            usedMedicines,
            recipeId
        } = req.body;

        const updateFields = {};

        if (status) updateFields.status = status;
        if (diagnosis) updateFields.diagnosis = diagnosis;
        if (prescription) updateFields.prescription = prescription;
        if (recipeId !== undefined) updateFields.recipeId = recipeId;
        if (usedMedicines) updateFields.usedMedicines = usedMedicines;

        if (animalInfo) {
            if (animalInfo.weight !== undefined) updateFields['animalInfo.weight'] = animalInfo.weight;
            if (animalInfo.temperature !== undefined) updateFields['animalInfo.temperature'] = animalInfo.temperature;
            if (animalInfo.condition !== undefined) updateFields['animalInfo.condition'] = animalInfo.condition;
        }

        const updated = await Appointment.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true }
        ).populate([
            {
                path: 'petId',
                populate: [
                    { path: 'ownerId', select: 'firstName lastName phone email' },
                    { path: 'speciesId', select: 'name' }
                ]
            },
            { path: 'procedureId', select: 'name' },
            { path: 'usedMedicines.medicineId', select: 'name price' },
            { path: 'recipeId', select: 'name' }
        ]);

        if (!updated) return res.status(404).json({ message: "Appointment not found" });

        res.json({ message: "Appointment updated", updated });

        await sendAppointmentEmail({ appointment: updated, type: 'updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error while updating appointment" });
    }
};

exports.remove = async (req, res) => {
    try {
        await Appointment.findByIdAndDelete(req.params.id);
        res.sendStatus(204);
    } catch (err) {
        console.error('remove error:', err);
        res.status(500).json({ message: 'Не вдалося видалити прийом' });
    }
};

exports.getAllAdmin = async (req, res) => {
    try {
        const { type, species, date, search, archived } = req.query;
        const filter = {};

        if (type === 'appointments') filter.status = { $ne: 'scheduled' };
        if (type === 'bookings') filter.status = 'scheduled';
        if (archived !== undefined) filter.isArchived = archived === 'true';
        if (date) filter.date = date;

        let results = await Appointment.find(filter)
            .populate([
                {
                    path: 'petId',
                    populate: [
                        { path: 'ownerId', select: 'firstName lastName phone email' },
                        { path: 'speciesId', select: 'name' }
                    ]
                },
                {
                    path: 'procedureId',
                    populate: { path: 'doctor', select: 'firstName lastName email' }
                },
                {
                    path: 'userId',
                    select: 'firstName lastName email'
                },
                {
                    path: 'recipeId',
                    populate: {
                        path: 'products.productId',
                        select: 'name unit price'
                    }
                },
                {
                    path: 'usedMedicines.medicineId',
                    select: 'name'
                }
            ])
            .sort({ date: -1, startTime: -1 });

        if (species) {
            results = results.filter(r => r.petId?.speciesId?._id?.toString() === species);
        }

        if (search) {
            const lower = search.toLowerCase();
            results = results.filter(a =>
                a.petId?.name?.toLowerCase().includes(lower) ||
                a.appointmentNumber?.toLowerCase().includes(lower) ||
                a.petId?.ownerId?.phone?.includes(lower) ||
                a.petId?.ownerId?.email?.toLowerCase().includes(lower) ||
                a.petId?.ownerId?.firstName?.toLowerCase().includes(lower) ||
                a.petId?.ownerId?.lastName?.toLowerCase().includes(lower)
            );
        }

        res.json(results);
    } catch (err) {
        console.error('❌ getAllAdmin error:', err);
        res.status(500).json({ message: err.message });
    }
};

exports.createByAdmin = async (req, res) => {
    const session = await Appointment.startSession();
    try {
        await session.withTransaction(async () => {
            const {
                userId,
                petId,
                procedureId,
                doctorId,
                date,
                startTime,
                comment
            } = req.body;

            if (!userId || !petId || !procedureId || !doctorId || !date || !startTime) {
                return res.status(400).json({ message: 'Не всі обовʼязкові поля заповнені' });
            }

            const lockKey = `lock:${date}:${startTime}`;
            const lock = await redis.set(lockKey, userId, { nx: true, px: 30000 });
            if (!lock) throw new Error("Цей слот уже заблокований іншим користувачем");

            const procedure = await Procedure.findById(procedureId);
            if (!procedure) throw new Error("Процедура не знайдена");

            const duration = procedure.duration;
            const [h, m] = startTime.split(':').map(Number);
            const endMinutes = h * 60 + m + duration;
            const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;

            const conflict = await Appointment.findOne({
                date,
                $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }]
            }).session(session);
            if (conflict) throw new Error("Слот уже зайнятий!");

            const appointmentNumber = await generateUniqueAppointmentNumber();

            const newAppointment = new Appointment({
                userId,
                petId,
                procedureId,
                appointmentNumber,
                date,
                startTime,
                endTime,
                comment: comment || '',
                status: 'scheduled',
                animalInfo: { weight: null, temperature: null, condition: '' },
                diagnosis: '',
                prescription: ''
            });

            await newAppointment.save({ session });

            io.emit('appointment:created', { date, startTime, endTime });
            res.status(201).json(newAppointment);

            await sendAppointmentEmail({ appointment: newAppointment, type: 'created' });
        });
    } catch (err) {
        console.error('❌ createByAdmin error:', err.message);
        res.status(409).json({ message: err.message });
    } finally {
        try {
            const { date, startTime } = req.body || {};
            if (date && startTime) {
                await redis.del(`lock:${date}:${startTime}`);
            }
        } catch (e) {
            console.error('❌ Redis unlock error:', e.message);
        }
    }
};

