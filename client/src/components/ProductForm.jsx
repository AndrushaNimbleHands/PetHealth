import React, {useEffect, useState} from 'react';
import Button from "./Button";

export default function ProductForm({onSave, existingProduct}) {
    const [form, setForm] = useState({
        name: '',
        shortDescription: '',
        longDescription: '',
        speciesId: '',
        isPrescriptionFree: false,
        category: '',
        unit: '',
        stock: 0,
        price: 0
    });

    const [speciesList, setSpeciesList] = useState([]);
    const [categoryList, setCategoryList] = useState([]);

    useEffect(() => {
        fetchSpecies();
        fetchCategories();
    }, []);

    const fetchSpecies = async () => {
        const res = await fetch('/api/species', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (res.ok) {
            const data = await res.json();
            setSpeciesList(data);
        }
    };

    const fetchCategories = async () => {
        const res = await fetch('/api/categories', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (res.ok) {
            const data = await res.json();
            setCategoryList(data);
        }
    };

    useEffect(() => {
        if (existingProduct && categoryList.length > 0) {
            setForm({
                name: existingProduct.name,
                shortDescription: existingProduct.shortDescription || '',
                longDescription: existingProduct.longDescription || '',
                speciesId: existingProduct.speciesId?._id || '',
                isPrescriptionFree: existingProduct.isPrescriptionFree || false,
                categoryId: existingProduct.categoryId?._id || '',
                unit: existingProduct.unit || '',
                stock: existingProduct.stock || 0,
                price: existingProduct.price || 0
            });
        }
    }, [existingProduct, categoryList]);



    const handleChange = (e) => {
        const {name, value, type, checked} = e.target;
        setForm(prev => ({
            ...prev, [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...form, speciesId: form.speciesId || null
        };
        const method = existingProduct ? 'PUT' : 'POST';
        const url = existingProduct ? `/api/products/${existingProduct._id}` : '/api/products';
        await fetch(url, {
            method, headers: {
                'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}`
            }, body: JSON.stringify(payload)
        });

        onSave();
        setForm({
            name: '',
            shortDescription: '',
            longDescription: '',
            speciesId: '',
            isPrescriptionFree: false,
            category: '',
            unit: '',
            stock: 0,
            price: 0
        });
    };

    return (<div className="product-form">
        <h2>{existingProduct ? 'Редагування товару' : 'Додати товар'}</h2>
        <div className={"product-form__name"}>
            <label>Назва товару: </label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Назва" required/>
        </div>
        <div className={"product-form__short-description"}>
            <label>Короткий опис: </label>
            <input name="shortDescription" value={form.shortDescription} onChange={handleChange}
                   placeholder="Короткий опис"/>
        </div>
        <div className={"product-form__long-description"}>
            <label>Довгий опис:</label>
            <textarea name="longDescription" value={form.longDescription} onChange={handleChange}
                      placeholder="Довгий опис"/>
        </div>

        <div className={"product-form__species"}>
            <label>Вид тварини: </label>
            <select name="speciesId" value={form.speciesId} onChange={handleChange}>
                <option value="">Універсальний</option>
                {speciesList.map(s => (<option key={s._id} value={s._id}>{s.name}</option>))}
            </select>
        </div>

        <div className={"product-form__category"}>
            <label>Категорія:</label>
            <select name="categoryId" value={form.categoryId} onChange={handleChange} required>
                <option value="">Оберіть категорію</option>
                {categoryList.map(c => (<option key={c._id} value={c._id}>{c.name}</option>))}
            </select>
        </div>

        <div className={"product-form__prescription"}>
            <label>

                Без рецепту
            </label>
            <input type="checkbox" name="isPrescriptionFree" checked={form.isPrescriptionFree}
                   onChange={handleChange}/>
        </div>
        <div className={"product-form__unit"}>
            <label>Одиниця виміру</label>
            <input name="unit" value={form.unit} onChange={handleChange} placeholder="таб, уп, шт..." required/>
        </div>
        <div className={"product-form__stock"}>
            <label>Кількість на складі:</label>
            <input name="stock" type="number" value={form.stock} onChange={handleChange} placeholder="Кількість"
                   required/>
        </div>
        <div className={"product-form__price"}>
            <label>Ціна (грн.):</label>
            <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="Ціна" required/>
        </div>
        <Button onClick={handleSubmit} content={existingProduct ? 'Зберегти зміни' : 'Додати товар'}
                className={"product-form__button product-form__save-button"}></Button>
    </div>);
}
