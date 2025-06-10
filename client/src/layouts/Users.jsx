import React, {useEffect, useState} from 'react';
import '../assets/styles/main.scss';
import Button from "../components/Button";
import {useNavigate} from 'react-router-dom';
import Field from "../components/Field";


export default function Users({}) {
    const [users, setUsers] = useState([]);
    const [roleFilter, setRoleFilter] = useState('');
    const [archivedOnly, setArchivedOnly] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [editFirstName, setEditFirstName] = useState('');
    const [editLastName, setEditLastName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editBirthday, setEditBirthday] = useState('');
    const [editRole, setEditRole] = useState('');
    const [newFirstName, setNewFirstName] = useState('');
    const [newLastName, setNewLastName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newBirthday, setNewBirthday] = useState('');
    const [newRole, setNewRole] = useState('user');

    const openModal = (user) => {
        setEditingUser(user);
        setEditFirstName(user.firstName || '');
        setEditLastName(user.lastName || '');
        setEditEmail(user.email || '');
        setEditRole(user.role || 'user');
        setEditPhone(user.phone || '');
        setEditBirthday(user.birthday ? user.birthday.slice(0, 10) : '');
    };

    const addUser = async () => {
        if (!newFirstName || !newLastName || !newEmail || !newPhone || !newRole) {
            window.alert("Для додавання нового користувача введіть усі дані!");
            return;
        }
        const confirmed = window.confirm("Додати нового користувача?");
        if (!confirmed) return;

        await fetch(`/api/users`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ` + localStorage.getItem('token'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                firstName: newFirstName,
                lastName: newLastName,
                email: newEmail,
                phone: newPhone,
                birthday: new Date(newBirthday),
                role: newRole
            })
        });

        fetchUsers();
        setNewFirstName('');
        setNewLastName('');
        setNewEmail('');
        setNewPhone('');
        setNewRole('client');
        setNewBirthday('');
    };

    const saveUserChanges = async () => {
        const confirmed = window.confirm("Зберегти оновлені дані?");
        if (!confirmed) return;
        await fetch(`/api/users/${editingUser._id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ` + localStorage.getItem('token'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                firstName: editFirstName,
                lastName: editLastName,
                email: editEmail,
                phone: editPhone,
                birthday: editBirthday,
                role: editRole
            })
        });
        fetchUsers();
        closeModal();
    };
    useEffect(() => {
        fetchUsers();
    }, [roleFilter, archivedOnly]);

    const fetchUsers = async () => {
        try {
            const res = await fetch(`/api/users?role=${roleFilter}&archived=${archivedOnly}`, {
                headers: {
                    'Authorization': `Bearer ` + localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                console.error('Помилка завантаження користувачів:', res.status);
                setUsers([]);
                return;
            }

            const data = await res.json();
            if (!Array.isArray(data)) {
                console.error('Очікувався масив користувачів, отримано:', data);
                setUsers([]);
                return;
            }

            setUsers(data);
        } catch (err) {
            console.error('Помилка при завантаженні користувачів:', err);
            setUsers([]);
        }
    };

    const archiveUser = async (id) => {
        const confirmed = window.confirm("Підтвердити архівування користувача?");
        if (!confirmed) return;
        await fetch(`/api/users/${id}/archive`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ` + localStorage.getItem('token')
            }
        });
        fetchUsers();
    };

    const restoreUser = async (id) => {
        const confirmed = window.confirm("Підтвердити відновлення користувача?");
        if (!confirmed) return;
        await fetch(`/api/users/${id}/restore`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ` + localStorage.getItem('token')
            }
        });
        fetchUsers();
    };

    const deleteUser = async (id) => {
        const confirmed = window.confirm("Підтвердити видалення користувача?");
        if (!confirmed) return;
        await fetch(`/api/users/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ` + localStorage.getItem('token')
            }
        });
        fetchUsers();
        window.alert("Користувача видалено!");
    };

    const closeModal = () => {
        setEditingUser(null);
    };
    return (
        <div className="users-container">

            {
                editingUser == null && (
                    <div className={"users-content"}>
                        <div>
                            <h1>Користувачі</h1>

                            <div className="users-filters">
                                <label>Фільтр:</label>
                                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                                    <option value="">Всі</option>
                                    <option value="admin">Адміністратори</option>
                                    <option value="doctor">Лікарі</option>
                                    <option value="client">Клієнти</option>
                                </select>
                                {
                                    archivedOnly && (
                                        <Button className={"users-button users__display-button"}
                                                onClick={() => setArchivedOnly(!archivedOnly)}
                                                content={"Показати активні"}></Button>
                                    )
                                }
                                {
                                    !archivedOnly && (
                                        <>
                                            <Button className={"users-button users__display-button"}
                                                    onClick={() => setArchivedOnly(!archivedOnly)}
                                                    content={"Показати архів"}></Button>
                                        </>

                                    )
                                }
                            </div>

                            <div className="users-list">
                                <hr/>
                                {Array.isArray(users) && users.map((user) => (
                                    <>
                                        <div className="user-card" key={user._id}>
                                            <div className="user-info">
                                                {user.firstName} {user.lastName}
                                                &nbsp;—&nbsp; <em> {user.role}</em>
                                            </div>

                                            <div className="user-card__buttons-container">
                                                {!user.isArchived ? (
                                                    <>
                                                        <Button className={"users-button users__edit-button"}
                                                                onClick={() => openModal(user)}
                                                                content={"Редагувати"}></Button>
                                                        <Button className={"users-button users__archive-button"}
                                                                onClick={() => archiveUser(user._id)}
                                                                content={"В архів"}></Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button className={"users-button users__restore-button"}
                                                                onClick={() => restoreUser(user._id)}
                                                                content={"Відновити"}></Button>
                                                        <Button className={"users-button users__delete-button"}
                                                                onClick={() => deleteUser(user._id)}
                                                                content={"Видалити"}></Button>
                                                    </>
                                                )}
                                            </div>

                                        </div>
                                        <hr/>
                                    </>
                                ))}
                            </div>
                        </div>
                        <div className="users-adding-container">
                            <h2>Новий користувач</h2>
                            <Field title={"Ім'я"} classNameTitle={"users-adding__field-title"}
                                   className={"users-adding__field"}
                                   value={newFirstName}
                                   onChange={(e) => setNewFirstName(e.target.value)} type={"text"}
                                   placeholder={"Ім'я"}/>
                            <Field title={"Прізвище"} classNameTitle={"users-adding__field-title"}
                                   className={"users-adding__field"}
                                   value={newLastName}
                                   onChange={(e) => setNewLastName(e.target.value)} type={"text"}
                                   placeholder={"Прізвище"}/>
                            <Field title={"Email"} classNameTitle={"users-adding__field-title"}
                                   className={"users-adding__field"}
                                   value={newEmail}
                                   onChange={(e) => setNewEmail(e.target.value)} type={"email"} placeholder={"Email"}/>
                            <Field title={"Телефон"} classNameTitle={"users-adding__field-title"}
                                   className={"users-adding__field"}
                                   value={newPhone}
                                   onChange={(e) => setNewPhone(e.target.value)} type={"phone"}
                                   placeholder={"+38 (XXX) XXX XX XX"}/>
                            <Field title={"Дата народження (мм/дд/рррр)"}
                                   classNameTitle={"users-adding__field-title"}
                                   className={"users-adding__field"}
                                   value={newBirthday}
                                   onChange={(e) => setNewBirthday(e.target.value)}
                                   type={"date"}/>

                            <div className="users-adding__role-selector">
                                <label>Роль:</label>
                                <select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                                    <option value="client">Клієнт</option>
                                    <option value="admin">Адміністратор</option>
                                    <option value="doctor">Лікар</option>
                                </select>
                            </div>

                            <div className="users-adding__buttons-container">
                                <Button className={"users-button users-adding__button users-adding__save-button"}
                                        onClick={addUser} content={"Зберегти"}/>
                            </div>
                        </div>
                    </div>
                )
            }


            {editingUser && (
                <div className="users-editing-container">
                    <h2>Редагування користувача</h2>
                    <Field title={"Ім'я"} classNameTitle={"users-editing__field-title"}
                           className={"users-editing__field users-editing__first-name-field"}
                           value={editFirstName}
                           onChange={(e) => setEditFirstName(e.target.value)} type={"text"}
                           placeholder={"Ім'я"}></Field>
                    <Field title={"Прізвище"} classNameTitle={"users-editing__field-title"}
                           className={"users-editing__field users-editing__last-name-field"}
                           value={editLastName}
                           onChange={(e) => setEditLastName(e.target.value)} type={"text"}
                           placeholder={"Прізвище"}></Field>
                    <Field title={"Email"} classNameTitle={"users-editing__field-title"}
                           className={"users-editing__field users-editing__email-field"}
                           value={editEmail}
                           onChange={(e) => setEditEmail(e.target.value)} type={"email"} placeholder={"Email"}></Field>
                    <Field title={"Телефон"} classNameTitle={"users-editing__field-title"}
                           className={"users-editing__field users-editing__phone-field"}
                           value={editPhone}
                           onChange={(e) => setEditPhone(e.target.value)} type={"phone"}
                           placeholder={"+38 (XXX) XXX XX XX"}></Field>
                    <Field title={"Дата народження (мм/дд/рррр)"}
                           classNameTitle={"users-editing__field-title"}
                           className={"users-editing__field users-editing__birthday-field"}
                           value={editBirthday}
                           onChange={(e) => setEditBirthday(e.target.value)}
                           type={"date"}/>

                    <div className="users-editing__selector users-editing__role-selector">

                        <label>Роль:</label>
                        <select value={editRole} onChange={(e) => setEditRole(e.target.value)}>
                            <option value="admin">Адміністратор</option>
                            <option value="doctor">Лікар</option>
                            <option value="client">Користувач</option>
                        </select>
                    </div>
                    <div className="users-editing__buttons-container">
                        <Button className={"users-button users-editing__button users-editing__save-button"}
                                onClick={saveUserChanges} content={"Зберегти"}></Button>
                        <Button className={"users-button users-editing__button users-editing__close-button"}
                                onClick={closeModal} content={"Скасувати"}></Button>
                    </div>

                </div>
            )}


        </div>
    );
}
