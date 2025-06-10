import React, {useEffect, useState} from 'react';
import Button from '../components/Button';
import Field from '../components/Field';

const AdminCreateAppointment = () => {
    const [users, setUsers] = useState([]);
    const [pets, setPets] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [procedures, setProcedures] = useState([]);
    const [filteredPets, setFilteredPets] = useState([]);

    const [selectedUser, setSelectedUser] = useState('');
    const [selectedPet, setSelectedPet] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [selectedProcedure, setSelectedProcedure] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [comment, setComment] = useState('');
    const [loadingSlots, setLoadingSlots] = useState(false);

    const todayStr = new Date().toISOString().split('T')[0];
    const authHeaders = {Authorization: 'Bearer ' + localStorage.getItem('token')};

    useEffect(() => {
        fetch('/api/users', {headers: authHeaders})
            .then(res => res.json())
            .then(data => {
                setUsers(data.filter(u => u.role === 'client'));
                setDoctors(data.filter(u => u.role === 'doctor'));
            });

        fetch('/api/petcards', {headers: authHeaders})
            .then(res => res.json())
            .then(setPets);

        fetch('/api/procedures', {headers: authHeaders})
            .then(res => res.json())
            .then(setProcedures);
    }, []);

    useEffect(() => {
        if (selectedUser) {
            const filtered = pets.filter(p => p.ownerId?._id === selectedUser);
            setFilteredPets(filtered);
        } else {
            setFilteredPets([]);
        }
        setSelectedPet('');
    }, [selectedUser, pets]);

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
            .then(setSlots)
            .catch(() => setSlots([]))
            .finally(() => setLoadingSlots(false));
    };

    const handleCreate = async () => {
        const res = await fetch('/api/appointments', {
            method: 'POST',
            headers: {
                ...authHeaders,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: selectedUser,
                petId: selectedPet,
                procedureId: selectedProcedure,
                doctorId: selectedDoctor,
                date: selectedDate,
                startTime: selectedSlot,
                comment
            })
        });

        if (res.status === 201) {
            alert('Прийом створено успішно!');
            setSelectedUser('');
            setSelectedPet('');
            setSelectedProcedure('');
            setSelectedDoctor('');
            setSelectedDate('');
            setSelectedSlot('');
            setComment('');
            setSlots([]);
        } else {
            const err = await res.json();
            alert('Помилка: ' + err.message);
        }
    };

    return (
        <div className="admin-appointment-container">
            <h1>Створити прийом</h1>

            <div className="appointment__field">
                <label>Власник:</label>
                <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
                    <option value="" disabled>Оберіть власника</option>
                    {users.map(u => (
                        <option key={u._id} value={u._id}>
                            {u.firstName} {u.lastName} ({u.email})
                        </option>
                    ))}
                </select>
            </div>

            <div className="appointment__field">
                <label>Тварина:</label>
                <select value={selectedPet} onChange={e => setSelectedPet(e.target.value)} disabled={!selectedUser}>
                    <option value="" disabled>Оберіть тварину</option>
                    {filteredPets.map(p => (
                        <option key={p._id} value={p._id}>
                            {p.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="appointment__field">
                <label>Процедура:</label>
                <select value={selectedProcedure} onChange={e => setSelectedProcedure(e.target.value)}>
                    <option value="" disabled>Оберіть процедуру</option>
                    {procedures.map(p => (
                        <option key={p._id} value={p._id}>
                            {p.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="appointment__field">
                <label>Дата</label>
                <input
                    className="appointment__field"
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    min={todayStr}
                />
            </div>


            <div className="appointment__slots-container">
                <label>Доступний час:</label>
                <div className="appointment__slots-list">
                    {selectedDate && selectedProcedure && selectedPet ? (
                        loadingSlots ? (
                            <p>Завантаження...</p>
                        ) : slots.length === 0 ? (
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
                    ) : (
                        <p>Заповність всі поля</p>
                    )}
                </div>
            </div>

            <div className="appointment__description-field">
                <label>Коментар (необов'язково):</label>
                <textarea
                    placeholder="Опишіть проблему"
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    className="appointment__description-textarea"
                />
            </div>

            <div className="appointment__buttons">
                <Button
                    onClick={handleCreate}
                    content="Створити прийом"
                    className="appointment__button appointment__save-button"
                />
            </div>
        </div>
    );
};

export default AdminCreateAppointment;
