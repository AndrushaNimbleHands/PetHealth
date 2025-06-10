import React, {useEffect, useState} from 'react';
import Button from "./Button";

export default function CategoryAdmin() {
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({name: '', _id: null});

    const fetchCategories = async () => {
        const res = await fetch('/api/categories', {
            headers: {Authorization: `Bearer ${localStorage.getItem('token')}`}
        });
        if (res.ok) {
            const data = await res.json();
            setCategories(data);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = form._id ? 'PUT' : 'POST';
        const url = form._id ? `/api/categories/${form._id}` : '/api/categories';

        await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({name: form.name})
        });

        setForm({name: '', _id: null});
        fetchCategories();
    };

    const handleEdit = (category) => setForm(category);

    const handleDelete = async (id) => {
        if (window.confirm('Видалити категорію?')) {
            await fetch(`/api/categories/${id}`, {
                method: 'DELETE',
                headers: {Authorization: `Bearer ${localStorage.getItem('token')}`}
            });
            fetchCategories();
        }
    };

    return (
        <div>
            <h2>Категорії</h2>
            <form onSubmit={handleSubmit} className={"category__name-field"}>
                <label>Назва категорії:</label>
                <div className={"category__name-input"}>

                    <input
                        placeholder="Категорія"
                        value={form.name}
                        onChange={e =>
                            setForm(f => ({...f, name: e.target.value}))}
                        required
                    />
                    <Button onClick={handleSubmit}
                            content={form._id ? 'Оновити' : 'Додати'}
                            className={"category__button category__save-button"}></Button>
                </div>
            </form>

            <ul className={"category__list"}>
                {categories.map(cat => (
                    <li key={cat._id}>
                        {cat.name}
                        <Button className={"category__button category__edit-button"} onClick={() => handleEdit(cat)} content={"✏"}></Button>
                        <Button className={"category__button category__delete-button"} onClick={() => handleDelete(cat._id)} content={"🗑"}></Button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
