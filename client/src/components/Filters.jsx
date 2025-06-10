import React, { useEffect, useState } from 'react';
import '../assets/styles/main.scss';

export default function Filters({ setFilters }) {
    const [species, setSpecies] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedSpecies, setSelectedSpecies] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch('/api/shop/species').then(res => res.json()).then(setSpecies);
        fetch('/api/shop/categories').then(res => res.json()).then(setCategories);
    }, []);

    useEffect(() => {
        const f = {};
        if (search) f.search = search;
        if (selectedSpecies) f.speciesId = selectedSpecies;
        if (selectedCategory) f.categoryId = selectedCategory;
        setFilters(f);
    }, [search, selectedSpecies, selectedCategory]);

    return (
        <div className="filters">
            <div className="filters-search">
                <label>Пошук: </label>
                <input
                    placeholder="Пошук..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
            <div className="filters-species">
                <label>Вид тварини: </label>
                <select value={selectedSpecies} onChange={e => setSelectedSpecies(e.target.value)}>
                    <option value="">Усі види</option>
                    {species.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
            </div>
            <div className="filters-category">
                <label>Категорія товару: </label>
                <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                    <option value="">Усі категорії</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
            </div>
        </div>
    );
}
