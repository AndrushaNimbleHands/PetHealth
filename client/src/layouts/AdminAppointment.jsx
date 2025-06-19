import React, {useEffect, useState} from 'react';
import Button from '../components/Button';
import '../assets/styles/main.scss';
import AdminCreateAppointment from "./AdminCreateAppointment";


export default function AdminAppointment() {
    const [appointments, setAppointments] = useState([]);
    const [speciesList, setSpeciesList] = useState([]);
    const [type, setType] = useState('appointments');
    const [archived, setArchived] = useState(false);
    const [speciesFilter, setSpeciesFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({});
    const [showRecipeModal, setShowRecipeModal] = useState(false);
    const [recipeProducts, setRecipeProducts] = useState([]);
    const [allMedicines, setAllMedicines] = useState([]);
    const [prescriptionMedicines, setPrescriptionMedicines] = useState([]);
    const [isCreating, setIsCreating] = useState(false);


    const refresh = () => {
        const params = new URLSearchParams({type, archived, species: speciesFilter, date: dateFilter, search});
        fetch(`/api/appointments/admin?${params.toString()}`, {
            headers: {Authorization: 'Bearer ' + localStorage.getItem('token')}
        })
            .then(res => res.json())
            .then(data => Array.isArray(data) ? setAppointments(data) : setAppointments([]))
            .catch(() => setAppointments([]));
    };

    const handleDelete = async (id) => {
        const appointment = appointments.find(a => a._id === id);
        const isCancelled = appointment?.status === 'cancelled';
        const isOlderThan30Days = new Date() - new Date(appointment.date) > 30 * 24 * 60 * 60 * 1000;

        if (!isCancelled || !isOlderThan30Days) {
            return alert('Видалити можна лише скасований прийом старше 30 днів.');
        }

        if (!window.confirm("Ви впевнені, що хочете остаточно видалити прийом?")) return;

        const res = await fetch(`/api/appointments/${id}`, {
            method: 'DELETE',
            headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
        });
        if (res.ok) {
            alert('Прийом видалено');
            refresh();
        } else {
            alert('Помилка при видаленні');
        }
    };


    useEffect(() => {
        const token = localStorage.getItem('token');

        fetch('/api/products', {headers: {Authorization: 'Bearer ' + token}})
            .then(res => res.json()).then(setAllMedicines);

        fetch('/api/products?prescription=true', {headers: {Authorization: 'Bearer ' + token}})
            .then(res => res.json()).then(setPrescriptionMedicines);

        fetch('/api/species', {headers: {Authorization: 'Bearer ' + token}})
            .then(res => res.json()).then(setSpeciesList);
    }, []);

    useEffect(refresh, [type, archived, speciesFilter, dateFilter, search]);

    const archive = async (id) => {
        const appointment = appointments.find(a => a._id === id);
        const isCancelled = appointment?.status === 'cancelled';
        const isOlderThan30Days = new Date() - new Date(appointment.date) > 30 * 24 * 60 * 60 * 1000;

        if (!isCancelled || !isOlderThan30Days) {
            return alert('Архівувати можна лише скасований прийом старше 30 днів.');
        }

        await fetch(`/api/appointments/${id}/archive`, {
            method: 'PATCH',
            headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
        });
        setExpanded(null);
        refresh();
    };


    const restore = async (id) => {
        await fetch(`/api/appointments/${id}/restore`, {
            method: 'PATCH',
            headers: {Authorization: 'Bearer ' + localStorage.getItem('token')}
        });
        setExpanded(null);
        refresh();
    };

    const saveEdit = async () => {
        const res = await fetch(`/api/appointments/${expanded._id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(form)
        });

        if (res.ok) {
            alert('Збережено!');
            setEditMode(false);
            setExpanded(null);
            refresh();
        } else {
            alert('Помилка при збереженні!');
        }
    };

    const statusMap = {
        scheduled: '🕒 Заплановано',
        in_progress: '🔄 Триває',
        completed: '✅ Завершено',
        cancelled: '❌ Скасовано'
    };

    return (
        <div className="admin-appointments-container">
            <h1>Прийоми</h1>
            {isCreating ? (
                    <>
                        <Button
                            className={"admin-appointments__button admin-appointments__back-button"}
                            content="Назад"
                            onClick={() => setIsCreating(false)}
                        />
                        <AdminCreateAppointment onCreated={() => {
                            setIsCreating(false);
                            refresh();
                        }} />
                    </>
                ) :
                (!expanded ? (
                <>
                    <div className="admin-appointments__filters">
                        <div className={"admin-appointments__filter"}>
                            <label>Вид тварини:</label>
                            <select value={speciesFilter} onChange={e => setSpeciesFilter(e.target.value)}>
                                <option value="">Усі тварини</option>
                                {speciesList.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className={"admin-appointments__filter"}>
                            <label>Дата прийому:</label>
                            <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}/>
                        </div>
                        <div className={"admin-appointments__filter"}>
                            <label>Пошук:</label>
                            <input type="text" placeholder="Пошук..." value={search}
                                   onChange={e => setSearch(e.target.value)}/>
                        </div>
                        <div className={"admin-appointments__filter-buttons"}>
                            <Button className={"admin-appointments__button admin-appointments__app-book-button"}
                                    content={type === 'appointments' ? 'Прийоми' : 'Записи'}
                                    onClick={() => setType(type === 'appointments' ? 'bookings' : 'appointments')}/>
                            <Button className={"admin-appointments__button admin-appointments__archive-button"}
                                    content={archived ? 'Показати активні' : 'Показати архів'}
                                    onClick={() => setArchived(p => !p)}/>
                            <Button
                                className={"admin-appointments__button admin-appointments__create-button"}
                                content="Створити прийом"
                                onClick={() => setIsCreating(true)}
                            />

                        </div>

                    </div>
                    <div className="admin-appointments__list">
                        {appointments.map(a => (
                            <div key={a._id} className="admin-appointments__list-item-container">
                                <div className={"admin-appointments__list-item"}>
                                    <div className="admin-appointments__list-item-info">
                                        <p>
                                            <h3>{a.appointmentNumber}</h3>
                                            {a.date} • {a.startTime} – {a.endTime} • <strong>{a.petId?.name}</strong>
                                        </p>
                                        <p>
                                            Статус: {statusMap[a.status] || a.status}
                                        </p>
                                        <p>Процедура: {a.procedureId?.name}  </p>
                                        <p>
                                            {a.petId?.ownerId?.firstName} {a.petId?.ownerId?.lastName}
                                        </p>
                                        <p>
                                            {a.petId?.ownerId?.phone}
                                        </p>
                                        <p>
                                            {a.petId?.ownerId?.email}
                                        </p>
                                    </div>
                                    <div className={"admin-appointments__list-item-buttons"}>
                                        <Button
                                            className={"admin-appointments__button admin-appointments__details-button"}
                                            content="Детальніше" onClick={() => setExpanded(a)}/>
                                        {!a.isArchived
                                            ? <Button
                                                className={"admin-appointments__button admin-appointments__app-book-button"}
                                                content="В архів" onClick={() => archive(a._id)}/>
                                            : <>
                                                <Button
                                                    className={"admin-appointments__button admin-appointments__restore-button"}
                                                    content="Відновити" onClick={() => restore(a._id)}/>
                                                <Button
                                                    className={"admin-appointments__button admin-appointments__delete-button"}
                                                    content="Видалити" onClick={() => handleDelete(a._id)}/>
                                            </>}
                                    </div>
                                </div>
                                <hr/>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="admin-appointments__details">
                    <h2>Прийом #{expanded.appointmentNumber}</h2>
                    <div className="admin-appointments__details-overflow">

                        <p><strong>Тварина:</strong> {expanded.petId?.name} ({expanded.petId?.speciesId?.name})</p>
                        <p>
                            <strong>Власник:</strong> {expanded.petId?.ownerId?.firstName} {expanded.petId?.ownerId?.lastName} •
                            📞 {expanded.petId?.ownerId?.phone}/{expanded.petId?.ownerId?.email}</p>
                        <p><strong>Процедура:</strong> {expanded.procedureId?.name}</p>
                        <p><strong>Дата:</strong> {expanded.date} | {expanded.startTime} – {expanded.endTime}</p>
                        <p><strong>Статус:</strong> {statusMap[expanded.status] || expanded.status}</p>
                        <p><strong>Коментар:</strong> {expanded.comment}</p>
                        <hr/>
                        {editMode ? (
                            <>
                                <div className="admin-appointments__details-editing-field">
                                    <label>Статус: </label>
                                    <select value={form.status || 'scheduled'}
                                            onChange={e => setForm({...form, status: e.target.value})}>
                                        <option value="scheduled">🕒 Заплановано</option>
                                        <option value="in_progress">🔄 Триває</option>
                                        <option value="completed">✅ Завершено</option>
                                        <option value="cancelled">❌ Скасовано</option>
                                    </select>
                                </div>
                                <div className="admin-appointments__details-editing-field">
                                    <label>Діагноз: </label>
                                    <textarea placeholder="Діагноз" value={form.diagnosis || ''}
                                              onChange={e => setForm({...form, diagnosis: e.target.value})}/>
                                </div>
                                <div className="admin-appointments__details-editing-field">
                                    <label>Призначення: </label>
                                    <textarea placeholder="Призначення" value={form.prescription || ''}
                                              onChange={e => setForm({...form, prescription: e.target.value})}/>
                                </div>
                                <div className="admin-appointments__details-editing-field">
                                    <label>Маса (кг): </label>
                                    <input type="number" placeholder="Маса" value={form.animalInfo?.weight || ''}
                                           onChange={e => setForm({
                                               ...form,
                                               animalInfo: {...form.animalInfo, weight: e.target.value}
                                           })}/>
                                </div>
                                <div className="admin-appointments__details-editing-field">
                                    <label>Температура (С): </label>
                                    <input type="number" placeholder="Температура"
                                           value={form.animalInfo?.temperature || ''}
                                           onChange={e => setForm({
                                               ...form,
                                               animalInfo: {...form.animalInfo, temperature: e.target.value}
                                           })}/>
                                </div>
                                <div className="admin-appointments__details-editing-field">
                                    <label>Загальний стан: </label>
                                    <textarea placeholder="Стан" value={form.animalInfo?.condition || ''}
                                              onChange={e => setForm({
                                                  ...form,
                                                  animalInfo: {...form.animalInfo, condition: e.target.value}
                                              })}/>
                                </div>
                                <div className="admin-appointments__details-editing-field admin-appointments__used-medicines-field">
                                    <label>Використані медикаменти: </label>
                                    {(form.usedMedicines || []).map((med, index) => (
                                        <div key={index} className={"admin-appointments__medicines-selector-container"}>
                                            <select
                                                value={med.medicineId?._id || med.medicineId}
                                                onChange={e => {
                                                    const updated = [...form.usedMedicines];
                                                    updated[index].medicineId = e.target.value;
                                                    setForm({...form, usedMedicines: updated});
                                                }}
                                            >
                                                <option value="">Обрати медикамент</option>
                                                {allMedicines.map(m => (
                                                    <option key={m._id} value={m._id}>{m.name}</option>
                                                ))}
                                            </select>
                                            <input
                                                type="number"
                                                value={med.quantity}
                                                onChange={e => {
                                                    const updated = [...form.usedMedicines];
                                                    updated[index].quantity = parseInt(e.target.value);
                                                    setForm({...form, usedMedicines: updated});
                                                }}
                                                placeholder="Кількість"
                                            />
                                            <Button
                                                className={"admin-appointments__button admin-appointments__cancel-button"}
                                                content="×"
                                                onClick={() => {
                                                    const updated = form.usedMedicines.filter((_, i) => i !== index);
                                                    setForm({...form, usedMedicines: updated});
                                                }}
                                            />
                                            {index === form.usedMedicines.length - 1 && (
                                                <Button
                                                    className={"admin-appointments__button admin-appointments__add-medicine-button"}
                                                    content="+"
                                                    onClick={() => setForm({
                                                        ...form,
                                                        usedMedicines: [...(form.usedMedicines || []), { medicineId: '', quantity: 1 }]
                                                    })}
                                                />
                                            )}
                                        </div>
                                    ))}

                                    {(form.usedMedicines || []).length === 0 && (
                                        <Button
                                            className={"admin-appointments__button admin-appointments__add-medicine-button"}
                                            content="+"
                                            onClick={() => setForm({
                                                ...form,
                                                usedMedicines: [{ medicineId: '', quantity: 1 }]
                                            })}
                                        />
                                    )}
                                </div>
                                <hr/>
                                <div className="admin-appointments__new-recipe-buttons">

                                    {!expanded.recipeId ? (
                                        <Button
                                            className={"admin-appointments__button admin-appointments__new-recipe-button"}
                                            content="Створити рецепт" onClick={() => setShowRecipeModal(true)}/>
                                    ) : (
                                        <Button
                                            className={"admin-appointments__button admin-appointments__edit-recipe-button"}
                                            content="Редагувати рецепт" onClick={() => {
                                            setRecipeProducts(expanded.recipeId.products.map(p => ({
                                                productId: p.productId?._id || p.productId,
                                                quantity: p.quantity
                                            })));
                                            setShowRecipeModal(true);
                                        }}/>
                                    )}
                                </div>

                                {showRecipeModal && (
                                    <div className="modal">
                                        <p>{expanded.recipeId ? 'Редагувати рецепт' : 'Створити рецепт'}</p>
                                        {recipeProducts.map((item, index) => (
                                            <div key={index} className={"admin-appointments__medicines-selector-container"}>
                                                <select value={item.productId} onChange={e => {
                                                    const updated = [...recipeProducts];
                                                    updated[index].productId = e.target.value;
                                                    setRecipeProducts(updated);
                                                }}>
                                                    <option value="">Обрати медикамент</option>
                                                    {prescriptionMedicines.map(m => (
                                                        <option key={m._id} value={m._id}>{m.name}</option>
                                                    ))}
                                                </select>
                                                <input
                                                    type="number"
                                                    placeholder="Кількість"
                                                    value={item.quantity}
                                                    onChange={e => {
                                                        const updated = [...recipeProducts];
                                                        updated[index].quantity = parseInt(e.target.value);
                                                        setRecipeProducts(updated);
                                                    }}
                                                />
                                                <Button
                                                    className={"admin-appointments__button admin-appointments__cancel-button"}
                                                    content="×"
                                                    onClick={() => {
                                                        setRecipeProducts(recipeProducts.filter((_, i) => i !== index));
                                                    }}
                                                />
                                                {index === recipeProducts.length - 1 && (
                                                    <Button
                                                        className={"admin-appointments__button admin-appointments__add-medicine-button"}
                                                        content="+"
                                                        onClick={() => setRecipeProducts([...recipeProducts, { productId: '', quantity: 1 }])}
                                                    />
                                                )}
                                            </div>
                                        ))}

                                        {recipeProducts.length === 0 && (
                                            <Button
                                                className={"admin-appointments__button admin-appointments__add-medicine-button"}
                                                content="+"
                                                onClick={() => setRecipeProducts([{ productId: '', quantity: 1 }])}
                                            />
                                        )}

                                        <div className={"admin-appointments__save-recipe-buttons"}>
                                            <Button
                                                className={"admin-appointments__button admin-appointments__save-button"}
                                                content="Зберегти рецепт"
                                                onClick={async () => {
                                                    const token = localStorage.getItem('token');
                                                    const res = await fetch(`/api/recipes/${expanded.recipeId ? expanded.recipeId._id : ''}`, {
                                                        method: expanded.recipeId ? 'PATCH' : 'POST',
                                                        headers: {
                                                            Authorization: 'Bearer ' + token,
                                                            'Content-Type': 'application/json'
                                                        },
                                                        body: JSON.stringify({
                                                            userId: expanded.userId?._id,
                                                            petId: expanded.petId?._id,
                                                            doctorId: expanded.procedureId?.doctor?._id,
                                                            products: recipeProducts,
                                                            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                                                            comment: ''
                                                        })
                                                    });
                                                    const data = await res.json();
                                                    if (res.ok) {
                                                        alert(expanded.recipeId ? 'Рецепт оновлено!' : `Рецепт створено (#${data.recipeNumber})`);
                                                        if (!expanded.recipeId) {
                                                            setForm(prev => ({...prev, recipeId: data._id}));
                                                        }
                                                        refresh();
                                                    } else {
                                                        alert('Помилка при збереженні рецепта');
                                                    }

                                                    setShowRecipeModal(false);
                                                    setRecipeProducts([]);
                                                }}
                                            />

                                            <Button className={"admin-appointments__button admin-appointments__back-button"} content="Закрити рецепт" onClick={() => {
                                                setShowRecipeModal(false);
                                                setRecipeProducts([]);
                                            }}/>
                                        </div>

                                    </div>
                                )}
                                <hr/>
                                <div className={"admin-appointments__editing-buttons"}>
                                    <Button className={"admin-appointments__button admin-appointments__save-button"}
                                            content="Зберегти" onClick={saveEdit}/>
                                    <Button className={"admin-appointments__button admin-appointments__back-button"}
                                            content="Скасувати" onClick={() => setEditMode(false)}/>
                                </div>
                            </>
                        ) : (
                            <>
                                <p><strong>Діагноз:</strong> {expanded.diagnosis || '—'}</p>
                                <p><strong>Призначення:</strong> {expanded.prescription || '—'}</p>
                                <p><strong>Вага:</strong> {expanded.animalInfo?.weight || '—'} кг</p>
                                <p><strong>Температура:</strong> {expanded.animalInfo?.temperature || '—'} °C</p>
                                <p><strong>Стан:</strong> {expanded.animalInfo?.condition || '—'}</p>
                                <p><strong>Використані медикаменти:</strong></p>
                                <ul>
                                    {(expanded.usedMedicines || []).map((med, i) => (
                                        <li key={i}>{med.medicineId?.name || '—'} × {med.quantity}</li>
                                    ))}
                                </ul>
                                {expanded.recipeId && (
                                    <>
                                        <p><strong>Рецепт #{expanded.recipeId.recipeNumber}</strong></p>
                                        <ul>
                                            {(expanded.recipeId.products || []).map((p, i) => (
                                                <li key={i}>{p.productId?.name || '—'} × {p.quantity}</li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                                <div className={"admin-appointments__details-buttons"}>
                                    <Button className={"admin-appointments__button admin-appointments__edit-button"}
                                            content="Редагувати" onClick={() => {
                                        setEditMode(true);
                                        setForm({
                                            status: expanded.status,
                                            diagnosis: expanded.diagnosis,
                                            prescription: expanded.prescription,
                                            animalInfo: expanded.animalInfo || {},
                                            usedMedicines: expanded.usedMedicines || [],
                                            recipeId: expanded.recipeId?._id || null
                                        });
                                    }}/>
                                    <Button className={"admin-appointments__button admin-appointments__back-button"}
                                            content="Назад" onClick={() => {
                                        setExpanded(null);
                                        setEditMode(false);
                                    }}/>
                                </div>

                            </>
                        )}



                    </div>
                </div>
            ))}
        </div>
    );
}
