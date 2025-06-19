import React, {useEffect, useState} from 'react';
import '../assets/styles/main.scss';
import Button from "../components/Button";
import {useNavigate} from 'react-router-dom';
import Field from "../components/Field";
import ProcedureItem from "../components/ProcedureItem";


export default function Procedure() {
    const [procedures, setProcedures] = useState([]);
    const [editing, setEditing] = useState(null);
    const [showArchive, setShowArchive] = useState(false);

    const token = localStorage.getItem('token');

    const fetchList = () => {
        fetch(`/api/procedures${showArchive ? '/archive' : ''}`, {
            headers: {Authorization: `Bearer ${token}`}
        })
            .then(res => res.ok ? res.json() : Promise.reject(res.status))
            .then(setProcedures)
            .catch(err => console.error('Failed to fetch procedures', err));
    };

    useEffect(fetchList, [showArchive]);

    const handleSave = (data) => {
        const method = data._id ? 'PUT' : 'POST';
        const url = data._id ? `/api/procedures/${data._id}` : `/api/procedures`;

        fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(data)
        }).then(() => {
            setEditing(null);
            fetchList();
        });
    };

    const archiveProcedure = async (id) => {
        const res = await fetch(`/api/appointments/with-procedure/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const related = await res.json();
        if (related.length > 0) {
            alert('Неможливо архівувати процедуру, на яку записані пацієнти.');
            return;
        }

        const confirmed = window.confirm("Ви впевнені, що хочете архівувати цю процедуру?");
        if (!confirmed) return;

        await fetch(`/api/procedures/${id}/archive`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchList();
    };

    const restoreProcedure = (id) => {
        fetch(`/api/procedures/${id}/restore`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then(fetchList);
    };

    const deleteProcedure = async (id) => {
        const res = await fetch(`/api/appointments/with-procedure/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const related = await res.json();
        if (related.length > 0) {
            alert('Неможливо видалити процедуру, на яку записані пацієнти.');
            return;
        }

        const confirmed = window.confirm("Ця дія незворотна. Ви впевнені, що хочете видалити процедуру?");
        if (!confirmed) return;

        await fetch(`/api/procedures/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchList();
    };

    return (
        <div className="procedures-container">

            {
                editing == null && (
                    <div className={"procedures-list"}>
                        <h1>{showArchive ? 'Архів процедур' : 'Список процедур'}</h1>
                        <Button className={"procedures-container__display-button procedures-container__button"}
                                onClick={() => setShowArchive(prev => !prev)}
                                content={showArchive ? 'Показати активні' : 'Показати архівовані'}>
                        </Button>
                        <hr/>
                        <ul>
                            {procedures.map(p => (
                                <>
                                    <li key={p._id}>
                                        {p.name} — {p.price}₴ — {p.duration} хв
                                        — {p.species.length ? p.species.map(s => s.name).join(', ') : 'Універсальна'}
                                        {!p.archived && (
                                            <div className={"procedures-button-container"}>
                                                <Button className={"procedures-button procedures__edit-button"}
                                                        onClick={() => setEditing(p)} content={"Редагувати"}></Button>
                                                <Button className={"procedures-button procedures__archive-button"}
                                                        onClick={() => archiveProcedure(p._id)}
                                                        content={"В архів"}></Button>
                                            </div>
                                        )}
                                        {p.archived && (
                                            <div className={"procedures-button-container"}>
                                                <Button className={"procedures-button procedures__restore-button"}
                                                        onClick={() => restoreProcedure(p._id)}
                                                        content={"Відновити"}></Button>
                                                <Button className={"procedures-button procedures__delete-button"}
                                                        onClick={() => deleteProcedure(p._id)}
                                                        content={"Видалити"}></Button>

                                            </div>
                                        )}

                                    </li>
                                    <hr/>
                                </>

                            ))}
                        </ul>

                    </div>
                )
            }

            <div className={"procedures-item"}>
                <h2>{editing ? 'Редагування' : 'Нова процедура'}</h2>
                <ProcedureItem onSubmit={handleSave} initial={editing} handleBack={() => setEditing(null)}/>
            </div>

        </div>
    );
}
