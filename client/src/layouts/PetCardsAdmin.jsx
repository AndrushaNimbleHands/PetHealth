import React, {useEffect, useState} from 'react';
import '../assets/styles/main.scss';
import Button from "../components/Button";
import {useNavigate} from 'react-router-dom';
import Field from "../components/Field";
import Selector from "../components/Selector";


export default function PetCardsAdmin({appointmentOnClick, petCardOnClick}) {
    const [cards, setCards] = useState([]);
    const [speciesList, setSpeciesList] = useState([]);
    const [ownersList, setOwnersList] = useState([]);
    const [archivedOnly, setArchivedOnly] = useState(false);
    const [speciesFilter, setSpeciesFilter] = useState('');
    const [ownerFilter, setOwnerFilter] = useState('');
    const [selectedCard, setSelectedCard] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        speciesId: '',
        breed: '',
        birthday: '',
        ownerId: ''
    });
    const [appointments, setAppointments] = useState([]);
    const [showArchivedAppointments, setShowArchivedAppointments] = useState(false);
    const [activeTab, setActiveTab] = useState('bookings');
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [editingAppointment, setEditingAppointment] = useState(null);
    const [appointmentForm, setAppointmentForm] = useState({
        status: '',
        weight: '',
        temperature: '',
        condition: '',
        diagnosis: '',
        prescription: '',
    });
    const [expandedAppointment, setExpandedAppointment] = useState(null);
    const [newCardForm, setNewCardForm] = useState({
        name: '',
        speciesId: '',
        breed: '',
        birthday: '',
        ownerId: ''
    });

    const [isBookingActive, setIsBookingActive] = useState(true);
    const [isAppointmentActive, setIsAppointmentActive] = useState(false);
    const [isOpened, setIsOpened] = useState(false);
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


    useEffect(() => {
        if (selectedCard) fetchAppointments();
    }, [selectedCard, showArchivedAppointments,]);

    const fetchAppointments = async () => {
        const res = await fetch(`/api/appointments/by-pet/${selectedCard._id}`, {
            headers: {'Authorization': 'Bearer ' + localStorage.getItem('token')}
        });
        if (res.ok) {
            const data = await res.json();
            const filtered = data
                .filter(a => !!a.isArchived === showArchivedAppointments)
                .sort((a, b) => {
                    const dateA = new Date(`${a.date}T${a.startTime}`);
                    const dateB = new Date(`${b.date}T${b.startTime}`);
                    return dateA - dateB;
                });
            ;
            setAppointments(filtered);
            setFilteredAppointments(filtered.filter(a => a.status !== 'scheduled'));
            setFilteredBookings(filtered.filter(a => a.status === 'scheduled'));
        }
    };

    useEffect(() => {
        fetchSpecies();
        fetchOwners();
    }, []);

    useEffect(() => {
        fetchCards();
    }, [archivedOnly, speciesFilter, ownerFilter]);


    const fetchSpecies = async () => {
        const res = await fetch('/api/species', {
            headers: {
                'Authorization': `Bearer ` + localStorage.getItem('token')
            }
        });
        if (res.ok) {
            const data = await res.json();
            setSpeciesList(data);
        }
    };

    const fetchOwners = async () => {
        const res = await fetch('/api/petcards/users', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });
        if (res.ok) {
            const data = await res.json();
            setOwnersList(data);
        }
    };

    const fetchCards = async () => {
        const query = new URLSearchParams();
        query.append('archived', archivedOnly ? 'true' : 'false');
        if (speciesFilter) query.append('species', speciesFilter);
        if (ownerFilter) query.append('owner', ownerFilter);

        const res = await fetch(`/api/petcards?${query.toString()}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (res.ok) {
            const data = await res.json();
            setCards(data);
        }
    };

    const archiveCard = async (id) => {
        const res = await fetch(`/api/appointments/by-pet/${id}`, {
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
        });
        const data = await res.json();
        if (data.length > 0) {
            alert('Неможливо архівувати пацієнта, оскільки існують пов’язані записи або прийоми.');
            return;
        }

        const confirmed = window.confirm("Підтвердити архівацію картки пацієнта?");
        if (!confirmed) return;

        await fetch(`/api/petcards/${id}/archive`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ` + localStorage.getItem('token')
            }
        });

        if (selectedCard?._id === id) setSelectedCard(null);
        fetchCards();
    };



    const restoreCard = async (id) => {
        const confirmed = window.confirm("Підтвердити відновлення картки пацієнта?");
        if (!confirmed) return;
        await fetch(`/api/petcards/${id}/restore`, {
            method: 'PATCH',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });
        setSelectedCard(null);
        fetchCards();
    };

    const deleteCard = async (id) => {
        const petAppointments = appointments.filter(a => a.petId === id || a.petId?._id === id);
        if (petAppointments.length > 0) {
            alert('Неможливо видалити пацієнта, оскільки існують пов’язані записи або прийоми.');
            return;
        }

        const confirmed = window.confirm("Підтвердити видалення картки пацієнта?");
        if (!confirmed) return;

        await fetch(`/api/petcards/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });
        setSelectedCard(null);
        fetchCards();
    };



    const handleSelect = (card) => {
        setSelectedCard(card);
    };
    const startEdit = () => {
        setEditForm({
            name: selectedCard.name || '',
            speciesId: selectedCard.speciesId?._id || '',
            breed: selectedCard.breed || '',
            birthday: selectedCard.birthday?.slice(0, 10) || '',
            ownerId: selectedCard.ownerId?._id || ''
        });
        setIsEditing(true);
    };

    const saveCard = async () => {
        window.alert("Картку пацієнта оновлено!");
        await fetch(`/api/petcards/${selectedCard._id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ` + localStorage.getItem('token')
            },
            credentials: 'include',
            body: JSON.stringify(editForm)
        });
        setIsEditing(false);
        setSelectedCard(null);
        fetchCards();
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('uk-UA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatAge = (birthdate) => {
        if (!birthdate) return '';
        const birth = new Date(birthdate);
        const now = new Date();

        let years = now.getFullYear() - birth.getFullYear();
        let months = now.getMonth() - birth.getMonth();

        if (months < 0) {
            years -= 1;
            months += 12;
        }

        return `${years} ${years === 1 ? 'рік' : years < 5 ? 'роки' : 'років'} ${months} ${months === 1 ? 'місяць' : months < 5 && months !== 0 ? 'місяці' : 'місяців'}`;
    };

    const archiveAppointment = async (id) => {
        const appt = appointments.find(a => a._id === id);
        const isCancelled = appt?.status === 'cancelled';
        const isOlderThan30Days = new Date() - new Date(appt.date) > 30 * 24 * 60 * 60 * 1000;

        if (!isCancelled || !isOlderThan30Days) {
            alert('Можна архівувати лише скасовані прийоми, яким більше 30 днів.');
            return;
        }

        if (!window.confirm("Архівувати прийом?")) return;

        await fetch(`/api/appointments/${id}/archive`, {
            method: 'PATCH',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
        });
        fetchAppointments();
    };


    const restoreAppointment = async (id) => {
        if (!window.confirm("Відновити прийом?")) return;
        await fetch(`/api/appointments/${id}/restore`, {
            method: 'PATCH',
            headers: {'Authorization': 'Bearer ' + localStorage.getItem('token')}
        });
        fetchAppointments();
    };

    const deleteAppointment = async (id) => {
        const appt = appointments.find(a => a._id === id);
        const isCancelled = appt?.status === 'cancelled';
        const isOlderThan30Days = new Date() - new Date(appt.date) > 30 * 24 * 60 * 60 * 1000;

        if (!isCancelled || !isOlderThan30Days) {
            alert('Видалити можна лише скасовані прийоми, яким більше 30 днів.');
            return;
        }

        if (!window.confirm("Видалити прийом?")) return;

        await fetch(`/api/appointments/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
        });
        fetchAppointments();
    };

    const saveAppointmentChanges = async (id) => {
        const res = await fetch(`/api/appointments/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({
                status: appointmentForm.status,
                animalInfo: {
                    weight: appointmentForm.weight,
                    temperature: appointmentForm.temperature,
                    condition: appointmentForm.condition
                },
                diagnosis: appointmentForm.diagnosis,
                prescription: appointmentForm.prescription
            })
        });
        if (res.ok) {
            window.alert('Дані про прийом оновлено');
            setEditingAppointment(null);
            fetchAppointments();
        } else {
            window.alert('Помилка при оновленні прийому');
        }
    };
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

    const createNewCard = async () => {
        const res = await fetch('/api/petcards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(newCardForm)
        });
        if (res.ok) {
            alert("Нову картку створено!");
            setNewCardForm({
                name: '',
                speciesId: '',
                breed: '',
                birthday: '',
                ownerId: ''
            });
            fetchCards();
        } else {
            const err = await res.json();
            alert('Помилка: ' + err.message);
        }
    };


    return (
        <div className="pet-card-admin-container">
            {!selectedCard ? (
                <div className={"pet-card-admin__general-container"}>
                    <div className={"pet-card-admin__list-container"}>
                        <h1>Картки пацієнтів</h1>
                        <div className="pet-card-admin__filters">
                            <label>Тип тварини:</label>
                            <select className={"pet-card-admin__filters-selector"} value={speciesFilter}
                                    onChange={(e) => setSpeciesFilter(e.target.value)}>
                                <option value="">Усі</option>
                                {speciesList.map((s) => (
                                    <option key={s._id} value={s._id}>{s.name}</option>
                                ))}
                            </select>

                            <label>Власник:</label>
                            <select className="pet-card-admin__filters-selector" value={ownerFilter}
                                    onChange={(e) => setOwnerFilter(e.target.value)}>
                                <option value="">Усі</option>
                                {ownersList.map((o) => (
                                    <option key={o._id} value={o._id}>{o.name}</option>
                                ))}
                            </select>
                            <Button className={"pet-card-admin__button pet-card-admin__display-button"}
                                    onClick={() => setArchivedOnly(!archivedOnly)}
                                    content={archivedOnly ? "Активні" : "Архів"}></Button>
                        </div>
                        <hr/>
                        <div className="pet-card-admin__card-list">
                            {cards.map((card) => (
                                <>
                                    <div key={card._id} className="pet-card-admin__card-item">
                                        <div className={"pet-card-admin__card-item-info"}>
                                            <strong>{card.name} ({card.speciesId?.name})</strong> <p/>
                                            Власник: {card.ownerId ? `${card.ownerId.firstName} ${card.ownerId.lastName}` : '—'}
                                        </div>
                                        <div className="pet-card-admin__card-item__buttons-container">
                                            {card.isArchived ? (
                                                <>
                                                    <Button
                                                        className={"pet-card-admin__button pet-card-admin__restore-button"}
                                                        onClick={() => restoreCard(card._id)}
                                                        content={"Відновити"}></Button>
                                                    <Button
                                                        className={"pet-card-admin__button pet-card-admin__delete-button"}
                                                        onClick={() => deleteCard(card._id)}
                                                        content={"Видалити"}></Button>
                                                </>
                                            ) : (
                                                <>
                                                    <Button
                                                        className={"pet-card-admin__button pet-card-admin__details-button"}
                                                        onClick={() => handleSelect(card)}
                                                        content={"Детальніше"}></Button>
                                                    <Button
                                                        className={"pet-card-admin__button pet-card-admin__archive-button"}
                                                        onClick={() => archiveCard(card._id)}
                                                        content={"В архів"}></Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <hr/>
                                </>
                            ))}
                        </div>
                    </div>
                    <div className={"pet-card-admin__new-card-container"}>
                        <div className="pet-card-admin__card-create">
                            <h2>Нова картка пацієнта</h2>
                            <Field className={"pet-card-admin__name"} classNameTitle={"pet-card-admin__name-title"}
                                   title={"Ім’я тварини:"} type="text" value={newCardForm.name}
                                   onChange={e => setNewCardForm({...newCardForm, name: e.target.value})}
                                   placeholder="Ім’я" required/>
                            <Selector
                                className={"pet-card-admin__species"}
                                label={`Вид тварини:`}
                                value={newCardForm.speciesId}
                                onChange={e => setNewCardForm({...newCardForm, speciesId: e.target.value})}
                                option="Оберіть вид"
                                speciesList={speciesList}
                            />
                            <Field className={"pet-card-admin__breed"} classNameTitle={"pet-card-admin__breed-title"}
                                   title={"Порода:"} type="text" value={newCardForm.breed}
                                   onChange={e => setNewCardForm({...newCardForm, breed: e.target.value})}
                                   placeholder="Порода" required/>
                            <Field className={"pet-card-admin__birthday"}
                                   classNameTitle={"pet-card-admin__birthday-title"}
                                   title={"Дата народження:"} type="date" value={newCardForm.birthday}
                                   onChange={e => setNewCardForm({...newCardForm, birthday: e.target.value})}
                                   placeholder="ММ/ДД/РРРР" required/>
                            <div className={`pet-card-admin__owner`}>
                                <label>Власник: </label>
                                <select value={newCardForm.ownerId}
                                        onChange={e => setNewCardForm({...newCardForm, ownerId: e.target.value})}>
                                    <option value="" disabled={true}>Оберіть власника</option>
                                    {ownersList.map(o => (
                                        <option key={o._id} value={o._id}>{o.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={"pet-card-admin__new-card-buttons"}>
                                <Button className={"pet-card-admin__button pet-card-admin__create-button"} content="Створити"
                                        onClick={createNewCard}/>
                            </div>
                        </div>

                    </div>

                </div>
            ) : (
                <div className="pet-card-admin__card-expanded-layout">

                    <div className="pet-card-admin__card-details pet-card-admin__card-info-section">
                        <div className="pet-card-admin__card-details pet-card-admin__card-info-section">
                            {isEditing ? (
                                <>
                                    <h1>Редагування картки</h1>
                                    <Field className={"pet-card-admin__name"} classNameTitle={"pet-card-admin__name-title"}
                                           title={"Ім’я тварини:"} type="text" value={editForm.name}
                                           onChange={e => setEditForm({...editForm, name: e.target.value})}
                                           placeholder="Ім’я" required/>
                                    <Selector
                                        className={"pet-card-admin__species"}
                                        label={`Вид тварини:`}
                                        value={editForm.speciesId}
                                        onChange={e => setEditForm({...editForm, speciesId: e.target.value})}
                                        option="Оберіть вид"
                                        speciesList={speciesList}
                                    />
                                    <Field className={"pet-card-admin__breed"} classNameTitle={"pet-card-admin__breed-title"}
                                           title={"Порода:"} type="text" value={editForm.breed}
                                           onChange={e => setEditForm({...editForm, breed: e.target.value})}
                                           placeholder="Порода" required/>
                                    <Field className={"pet-card-admin__birthday"}
                                           classNameTitle={"pet-card-admin__birthday-title"}
                                           title={"Дата народження:"} type="date" value={editForm.birthday}
                                           onChange={e => setEditForm({...editForm, birthday: e.target.value})}
                                           placeholder="ММ/ДД/РРРР" required/>
                                    <div className={`pet-card-admin__owner`}>
                                        <label>Власник: </label>
                                        <select value={editForm.ownerId}
                                                onChange={e => setEditForm({...editForm, ownerId: e.target.value})}>
                                            <option value="" disabled={true}>Оберіть власника</option>
                                            {ownersList.map(o => (
                                                <option key={o._id} value={o._id}>{o.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="pet-card-admin__edit-card-buttons">
                                        <Button className={"pet-card-admin__button pet-card-admin__create-button"} content="Зберегти" onClick={saveCard}/>
                                        <Button className={"pet-card-admin__button pet-card-admin__back-button"} content="Скасувати" onClick={() => setIsEditing(false)}/>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h1>Картка пацієнта</h1>
                                    <div className={"pet-card-admin__card-item-info"}>
                                        <p>Ім'я: {selectedCard.name}</p>
                                        <p>Вид: {selectedCard.speciesId?.name}</p>
                                        <p>Порода: {selectedCard.breed}</p>
                                        <p>Дата
                                            народження: {formatDate(selectedCard.birthday)} ({formatAge(selectedCard.birthday)})</p>
                                        <p>Власник: {selectedCard.ownerId?.firstName} {selectedCard.ownerId?.lastName}</p>
                                        <div className="pet-card-admin__card-item-buttons pet-card-admin__card-item-info-buttons">
                                            <Button className="pet-card-admin__card-item-button pet-card-admin__archive-button"
                                                    onClick={() => archiveCard(selectedCard._id)} content={"В архів"}/>
                                            <Button className="pet-card-admin__card-item-button pet-card-admin__edit-button"
                                                    onClick={startEdit} content={"Редагувати"}/>
                                            <Button className="pet-card-admin__card-item-button pet-card-admin__back-button"
                                                    onClick={() => {
                                                        setSelectedCard(null);
                                                        setActiveTab('bookings');
                                                    }} content={"Назад"}/>
                                        </div>
                                    </div>

                                    <hr/>
                                    {
                                        !expandedAppointment && (
                                            <div className={"pet-card-admin__card-item-appointment-buttons"}>
                                                <Button
                                                    className={`pet-card-admin__card-item-button pet-card-admin__appointment-button${isAppointmentActive ? "-active" : ""}`}
                                                    content={"Прийоми"}
                                                    onClick={() => {
                                                        setActiveTab('appointments');
                                                        setIsAppointmentActive(true);
                                                        setIsBookingActive(false);
                                                    }}/>
                                                <Button
                                                    className={`pet-card-admin__card-item-button pet-card-admin__booking-button${isBookingActive ? "-active" : ""}`}
                                                    content={"Записи"}
                                                    onClick={() => {
                                                        setActiveTab('bookings');
                                                        setIsAppointmentActive(false);
                                                        setIsBookingActive(true);
                                                    }}/>
                                                <Button
                                                    className={"pet-card-admin__card-item-button pet-card-admin__archive-restore-button"}
                                                    onClick={() => setShowArchivedAppointments(prev => !prev)}
                                                    content={showArchivedAppointments ? "Активні" : "Архів"}/>
                                            </div>
                                        )
                                    }


                                    <div className="pet-card-admin__card-item-appointments-list">
                                        {
                                            !expandedAppointment && (activeTab === 'bookings' ? (
                                                <div className={"pet-card-admin__title"}>
                                                    Записи
                                                    {filteredBookings.length === 0 && (
                                                        <div>-- Поки порожньо --</div>
                                                    )}
                                                </div>
                                            ) : !expandedAppointment && (activeTab === "appointments" ? (
                                                <div className={"pet-card-admin__title"}>
                                                    Прийоми
                                                    {filteredAppointments.length === 0 && (
                                                        <div>-- Поки порожньо --</div>
                                                    )}
                                                </div>) : <></>))
                                        }

                                        <div className="pet-card-admin__appointments-list">
                                            {(activeTab === 'appointments' ? filteredAppointments : filteredBookings).map((appt) => {

                                                if (!isOpened) {
                                                    return (
                                                        <div key={appt._id} className="pet-card-admin__appointments-list-item__container">
                                                            <div className={"pet-card-admin__appointments-list-item"}>
                                                                <div className={"pet-card-admin__appointment-item-short-info"}>
                                                                    {getStatusIcon(appt.status)} {formatDate(appt.date)} • {appt.startTime} – {appt.endTime} • {appt.procedureId?.name}
                                                                </div>
                                                                <div className="pet-card-admin__appointment-item-buttons">
                                                                    <Button content="Детальніше"
                                                                            onClick={() => {
                                                                                setExpandedAppointment(appt._id);
                                                                                setIsOpened(true);
                                                                            }}
                                                                            className={"pet-card-admin__card-item-button"}/>
                                                                    {!appt.isArchived ? (
                                                                        <Button content="В архів"
                                                                                onClick={() => archiveAppointment(appt._id)}
                                                                                className={"pet-card-admin__card-item-button pet-card-admin__archive-button"}/>
                                                                    ) : (
                                                                        <>
                                                                            <Button content="Відновити"
                                                                                    onClick={() => restoreAppointment(appt._id)}
                                                                                    className={"pet-card-admin__card-item-button"}/>
                                                                            <Button content="Видалити"
                                                                                    onClick={() => deleteAppointment(appt._id)}
                                                                                    className={"pet-card-admin__card-item-button pet-card-admin__delete-button"}/>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <hr/>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>


                    </div>
                    {expandedAppointment && (
                        <div className="pet-card-admin__appointment-details">

                            {
                                isEditing == null ? <h2>Інформація про прийом</h2> : <h2>Редагування прийому</h2>
                            }

                            {(() => {
                                const appt = appointments.find(a => a._id === expandedAppointment);
                                if (!appt) return null;

                                const isEditing = editingAppointment === appt._id;

                                return isEditing ? (
                                    <div className={"pet-card-admin__appointment-editing-container"}>
                                        <div className={"pet-card-admin__appointment-status"}>
                                            <label>Статус:</label>
                                            <select value={appointmentForm.status}
                                                    onChange={e => setAppointmentForm({
                                                        ...appointmentForm,
                                                        status: e.target.value
                                                    })}>
                                                <option value="scheduled">Запланований</option>
                                                <option value="in_progress">Почався</option>
                                                <option value="cancelled">Скасований</option>
                                                <option value="completed">Завершений</option>
                                            </select>
                                        </div>

                                        <div className="pet-card-admin__appointment-weight">
                                            <label>Вага (кг):</label>
                                            <input type="number" value={appointmentForm.weight || ''}
                                                   onChange={e => setAppointmentForm({
                                                       ...appointmentForm,
                                                       weight: e.target.value
                                                   })}/>
                                        </div>

                                        <div className="pet-card-admin__appointment-temperature">
                                            <label>Температура (°C):</label>
                                            <input type="number" value={appointmentForm.temperature || ''}
                                                   onChange={e => setAppointmentForm({
                                                       ...appointmentForm,
                                                       temperature: e.target.value
                                                   })}/>
                                        </div>

                                        <div className="pet-card-admin__appointment-condition">
                                            <label>Стан:</label>
                                            <textarea value={appointmentForm.condition || ''}
                                                      onChange={e => setAppointmentForm({
                                                          ...appointmentForm,
                                                          condition: e.target.value
                                                      })}/>
                                        </div>

                                        <div className="pet-card-admin__appointment-diagnosis">
                                            <label>Діагноз:</label>
                                            <textarea value={appointmentForm.diagnosis || ''}
                                                      onChange={e => setAppointmentForm({
                                                          ...appointmentForm,
                                                          diagnosis: e.target.value
                                                      })}/>
                                        </div>
                                        <div className="pet-card-admin__appointment-prescription">
                                            <label>Призначення:</label>
                                            <textarea value={appointmentForm.prescription || ''}
                                                      onChange={e => setAppointmentForm({
                                                          ...appointmentForm,
                                                          prescription: e.target.value
                                                      })}/>
                                        </div>


                                        <div className="pet-card-admin__card-item-appointment-buttons">
                                            <Button content="Зберегти"
                                                    onClick={() => saveAppointmentChanges(appt._id)}
                                                    className={"pet-card-admin__card-item-button"}/>
                                            <Button content="Скасувати" onClick={() => setEditingAppointment(null)}
                                                    className={"pet-card-admin__card-item-button pet-card-admin__card-item-back-button"}/>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <p><strong>Номер прийому:</strong> {appt.appointmentNumber || '—'}</p>
                                        <p><strong>Статус:</strong> {translateStatus(appt.status)}</p>
                                        <p><strong>Дата:</strong> {formatDate(appt.date)}</p>
                                        <p><strong>Час:</strong> {appt.startTime} – {appt.endTime}</p>
                                        <p><strong>Процедура:</strong> {appt.procedureId?.name}</p>
                                        <p><strong>Вартість:</strong> {appt.procedureId?.price}</p>
                                        <p>
                                            <strong>Лікар:</strong> {appt.procedureId?.doctor?.firstName} {appt.procedureId?.doctor?.lastName}
                                        </p>
                                        <p><strong>Коментар:</strong> {appt.comment || '—'}</p>
                                        <p><strong>Вага:</strong> {appt.animalInfo?.weight ?? '—'}</p>
                                        <p><strong>Температура:</strong> {appt.animalInfo?.temperature ?? '—'}</p>
                                        <p><strong>Стан:</strong> {appt.animalInfo?.condition || '—'}</p>
                                        <p><strong>Діагноз:</strong> {appt.diagnosis || '—'}</p>
                                        <p><strong>Призначення:</strong> {appt.prescription || '—'}</p>
                                        <p><strong>Загальна вартість:</strong> {appt.totalPrice || '—'}</p>


                                        {!appt.isArchived && (
                                            <Button content="Редагувати"
                                                    className={"pet-card-admin__button pet-card-admin__appointment-editing-button"}
                                                    onClick={() => {
                                                        setAppointmentForm({
                                                            status: appt.status,
                                                            weight: appt.animalInfo?.weight,
                                                            temperature: appt.animalInfo?.temperature,
                                                            condition: appt.animalInfo?.condition,
                                                            diagnosis: appt.diagnosis,
                                                            prescription: appt.prescription,
                                                            totalPrice: appt.totalPrice
                                                        });
                                                        setEditingAppointment(appt._id);
                                                    }}/>
                                        )}
                                        <Button content="Назад до списку"
                                                className={"pet-card-admin__button pet-card-admin__back-button pet-card-admin__appointment-back-button"}
                                                onClick={() => {
                                                    setExpandedAppointment(null);
                                                    setEditingAppointment(null);
                                                    setIsOpened(false);
                                                }}/>

                                    </>
                                );
                            })()}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
