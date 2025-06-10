import React, { useEffect, useState } from 'react';
import Button from '../components/Button';
import Field from '../components/Field';
import { io } from 'socket.io-client';

const socket = io(process.env.REACT_APP_API_URL);

export default function Appointment() {
    const [pets, setPets] = useState([]);
    const [procedures, setProcedures] = useState([]);
    const [selectedPet, setSelectedPet] = useState('');
    const [selectedProcedure, setSelectedProcedure] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [comment, setComment] = useState('');
    const [loadingSlots, setLoadingSlots] = useState(false);

    const todayStr = new Date().toISOString().split('T')[0];

    const authHeaders = {
        Authorization: 'Bearer ' + localStorage.getItem('token')
    };

    useEffect(() => {
        socket.on('appointment:created', (data) => {
            if (data.date === selectedDate) {
                fetchSlots();
            }
        });

        return () => {
            socket.off('appointment:created');
        };
    }, [selectedDate, selectedProcedure]);

    useEffect(() => {
        fetch('/api/petcards/mine', { headers: authHeaders })
            .then(res => res.json())
            .then(setPets);
        fetch('/api/procedures', { headers: authHeaders })
            .then(res => res.json())
            .then(setProcedures);
    }, []);

    useEffect(() => {
        if (selectedDate && selectedProcedure && selectedPet) {
            fetchSlots();
        } else {
            setSlots([]);
        }
    }, [selectedDate, selectedProcedure, selectedPet]);

    const fetchSlots = () => {
        setLoadingSlots(true);
        fetch(`/api/appointments/slots?date=${selectedDate}&procedureId=${selectedProcedure}`, {
            headers: authHeaders
        })
            .then(res => res.json())
            .then(data => setSlots(data))
            .catch(() => setSlots([]))
            .finally(() => setLoadingSlots(false));
    };

    const handleBook = async () => {
        const res = await fetch('/api/appointments', {
            method: 'POST',
            headers: {
                ...authHeaders,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                petId: selectedPet,
                procedureId: selectedProcedure,
                date: selectedDate,
                startTime: selectedSlot,
                comment
            })
        });

        if (res.status === 201) {
            alert('Запис успішно створено!');
            setSlots([]);
            setSelectedPet('');
            setSelectedProcedure('');
            setSelectedDate('');
            setSelectedSlot('');
            setComment('');
        } else {
            const err = await res.json();
            alert('Помилка: ' + err.message);
        }
    };

    return (
        <div className="appointment-container">
            <h1>Запис на прийом</h1>

            <div className={"appointment__pet-card-field"}>
                <label>Пацієнт:</label>
                <select value={selectedPet} onChange={e => setSelectedPet(e.target.value)}>
                    <option value="" disabled={true}>Оберіть тварину</option>
                    {pets.map(pet => (
                        <option key={pet._id} value={pet._id}>
                            {pet.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="appointment__procedure-field">
                <label>Процедура</label>
                <select value={selectedProcedure} onChange={e => setSelectedProcedure(e.target.value)}>
                    <option value="" disabled={true}>Оберіть процедуру</option>
                    {procedures.map(proc => (
                        <option key={proc._id} value={proc._id}>
                            {proc.name}
                        </option>
                    ))}
                </select>
            </div>

            <Field
                className={"appointment__date-field"}
                classNameTitle={"appointment__procedure-field__title"}
                type="date"
                title="Дата прийому (MM/ДД/РРРР): "
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                min={todayStr}
            />

            <div className={"appointment__slots-container"}>
                <label>Доступний час:</label><br />
                <div className="appointment__slots-list">
                    {
                        selectedDate && selectedProcedure && selectedPet && (
                            loadingSlots ? (
                                <p>Завантаження...</p>
                            ) : (
                                slots.length === 0 ? (
                                    <p>Немає доступних слотів</p>
                                ) : (
                                    slots.map((s, i) => (
                                        <Button
                                            key={i}
                                            onClick={() => setSelectedSlot(s.start)}
                                            className={`appointment__slots-item ${selectedSlot === s.start ? 'selected-slot' : ''}`}
                                            content={`${s.start} - ${s.end}`}
                                        />
                                    ))
                                )
                            )
                        )
                    }
                </div>
            </div>

            <div className={"appointment__description-field"}>
                <label>Опис проблеми (необов'язково): </label>
                <textarea
                    placeholder="Опишіть проблему"
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    className={"appointment__description-textarea"}
                />
            </div>

            <div className={"appointment__buttons"}>
                <Button
                    onClick={handleBook}
                    content="Підтвердити запис"
                    className={"appointment__button appointment__save-button"}
                />
            </div>
        </div>
    );
}
