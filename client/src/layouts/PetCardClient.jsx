import React, {useEffect, useState} from 'react';
import Button from '../components/Button';

export default function PetCardClient() {
    const [myCards, setMyCards] = useState([]);
    const [selectedCardId, setSelectedCardId] = useState('');
    const [selectedCard, setSelectedCard] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [expandedAppointment, setExpandedAppointment] = useState(null);
    const [activeTab, setActiveTab] = useState('bookings');

    useEffect(() => {
        fetch('/api/client/petcards/mine', {
            headers: {Authorization: 'Bearer ' + localStorage.getItem('token')}
        })
            .then(res => res.json())
            .then(data => {
                const activeCards = data.filter(c => !c.isArchived);
                setMyCards(activeCards);
                if (activeCards.length > 0) {
                    setSelectedCardId(activeCards[0]._id);
                    setSelectedCard(activeCards[0]);
                }
            });
    }, []);
    useEffect(() => {
        const found = myCards.find(card => card._id === selectedCardId);
        if (found) setSelectedCard(found);
    }, [selectedCardId, myCards]);


    useEffect(() => {
        if (!selectedCardId) return;

        fetch(`/api/client/appointments/${selectedCardId}`, {
            headers: {Authorization: 'Bearer ' + localStorage.getItem('token')}
        })
            .then(async res => {
                if (!res.ok) {
                    const err = await res.text();
                    throw new Error(`Fetch error ${res.status}: ${err}`);
                }
                return res.json();
            })
            .then(data => {
                const active = data.filter(a => !a.isArchived);
                const sorted = active.sort((a, b) => {
                    const da = new Date(`${a.date}T${a.startTime}`);
                    const db = new Date(`${b.date}T${b.startTime}`);
                    return da - db;
                });
                setAppointments(sorted);
                setFilteredAppointments(sorted.filter(a => a.status !== 'scheduled'));
                setFilteredBookings(sorted.filter(a => a.status === 'scheduled'));
            })
            .catch(err => console.error("FETCH ERROR:", err));
    }, [selectedCardId]);

    const handleCancel = async (appt) => {
        const now = new Date();
        const apptTime = new Date(`${appt.date}T${appt.startTime}`);
        const diffHours = (apptTime - now) / (1000 * 60 * 60);

        if (diffHours < 12) {
            alert("Скасування можливе не пізніше ніж за 12 годин.");
            return;
        }

        if (!window.confirm("Скасувати запис?")) return;

        await fetch(`/api/client/appointments/${appt._id}/cancel`, {
            method: 'PATCH',
            headers: {Authorization: 'Bearer ' + localStorage.getItem('token')}
        });

        setAppointments(prev => prev.map(a => a._id === appt._id ? {...a, status: 'cancelled'} : a));
        setExpandedAppointment(null);
    };

    const formatDate = (str) => new Date(str).toLocaleDateString('uk-UA');
    const translateStatus = (status) => {
        switch (status) {
            case 'scheduled':
                return 'Запланований';
            case 'in_progress':
                return 'Почався';
            case 'cancelled':
                return 'Скасований';
            case 'completed':
                return 'Завершений';
            default:
                return status;
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'scheduled':
                return '⏰'; // годинник
            case 'in_progress':
                return '✏️'; // олівець
            case 'cancelled':
                return '❌'; // червоний хрестик
            case 'completed':
                return '✅'; // галочка
            default:
                return '';
        }
    };
    return (
        <div className="pet-card-client__container">
            <div className="pet-card-client__card-info-container">
                <h1>Мої тварини</h1>
                <div className={"pet-card-client__pet-name"}>
                    <label>Оберіть тварину: </label>
                    <select value={selectedCardId} onChange={e => setSelectedCardId(e.target.value)}>
                        {myCards.map(c => (
                            <option key={c._id} value={c._id}>
                                {c.name} ({c.speciesId?.name})
                            </option>
                        ))}
                    </select>
                </div>


                {selectedCard && (
                    <>
                        <div className="pet-card-client__pet-info">
                            <p><strong>Ім’я:</strong> {selectedCard.name}</p>
                            <p><strong>Вид:</strong> {selectedCard.speciesId?.name}</p>
                            <p><strong>Порода:</strong> {selectedCard.breed || '—'}</p>
                            <p><strong>Дата народження:</strong> {formatDate(selectedCard.birthday)}</p>
                        </div>
                        <div className="pet-card-client__buttons">
                            <Button content="Прийоми" onClick={() => setActiveTab('appointments')}
                                    className={`pet-card-client__button pet-card-client__appointments-button${activeTab === 'appointments' ? '-active' : ''}`}
                            />
                            <Button content="Записи" onClick={() => setActiveTab('bookings')}
                                    className={`pet-card-client__button pet-card-client__bookings-button${activeTab === 'bookings' ? '-active' : ''}`}/>
                        </div>
                    </>
                )}
                {
                    !expandedAppointment && (activeTab === 'bookings' ? (
                        <div className={"pet-card-client__title"}>
                            Записи
                            {filteredBookings.length === 0 && (
                                <div>-- Поки порожньо --</div>
                            )}
                        </div>
                    ) : !expandedAppointment && (activeTab === "appointments" ? (
                        <div className={"pet-card-client__title"}>
                            Прийоми
                            {filteredAppointments.length === 0 && (
                                <div>-- Поки порожньо --</div>
                            )}
                        </div>) : <></>))
                }
                {!expandedAppointment && (
                    <>
                        <div className="pet-card-client__appointments-list">
                            {(activeTab === 'appointments' ? filteredAppointments : filteredBookings).map(appt => (
                                <div key={appt._id} >
                                    <div className="pet-card-client__appointments-list-item">
                                        {getStatusIcon(appt.status)} {formatDate(appt.date)} • {appt.startTime} – {appt.endTime} • {appt.procedureId?.name}
                                        <Button content="Детальніше" onClick={() => setExpandedAppointment(appt)}
                                                className={"pet-card-client__button pet-card-client__details-button"}/>
                                    </div>
                                    <hr/>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
            <div className={"pet-card-client__appointments-info-container"}>
                {expandedAppointment && (
                    <div className="client-pet-card-appointment-details">
                        <h2>Інформація про прийом</h2>
                        <p><strong>Номер:</strong> {expandedAppointment.appointmentNumber || '—'}</p>
                        <p><strong>Статус:</strong> {translateStatus(expandedAppointment.status)}</p>
                        <p><strong>Дата:</strong> {formatDate(expandedAppointment.date)}</p>
                        <p><strong>Час:</strong> {expandedAppointment.startTime} – {expandedAppointment.endTime}</p>
                        <p><strong>Процедура:</strong> {expandedAppointment.procedureId?.name}</p>
                        <p>
                            <strong>Лікар:</strong> {expandedAppointment.procedureId?.doctor?.firstName} {expandedAppointment.procedureId?.doctor?.lastName}
                        </p>
                        <p><strong>Коментар:</strong> {expandedAppointment.comment || '—'}</p>
                        <p><strong>Вага:</strong> {expandedAppointment.animalInfo?.weight || '—'}</p>
                        <p><strong>Температура:</strong> {expandedAppointment.animalInfo?.temperature || '—'}</p>
                        <p><strong>Стан:</strong> {expandedAppointment.animalInfo?.condition || '—'}</p>
                        <p><strong>Діагноз:</strong> {expandedAppointment.diagnosis || '—'}</p>
                        <p><strong>Призначення:</strong> {expandedAppointment.prescription || '—'}</p>

                        {expandedAppointment.status === 'scheduled' && (
                            <Button content="Скасувати запис" onClick={() => handleCancel(expandedAppointment)}
                            className={"pet-card-client__button pet-card-client__cancel-button"}/>
                        )}
                        <Button content="Назад" onClick={() => setExpandedAppointment(null)}
                        className={"pet-card-client__button pet-card-client__back-button"}/>
                    </div>
                )}
            </div>


        </div>
    );
}
