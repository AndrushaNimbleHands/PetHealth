import React, {useEffect, useState} from 'react';
import ProductForm from '../components/ProductForm';
import Category from '../components/Category';
import Button from "../components/Button";
import AdminOrders from "./AdminOrders";

export default function PharmacyAdmin() {
    const [products, setProducts] = useState([]);
    const [editProduct, setEditProduct] = useState(null);
    const [showArchived, setShowArchived] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [speciesFilter, setSpeciesFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [speciesList, setSpeciesList] = useState([]);
    const [categoryList, setCategoryList] = useState([]);
    useEffect(() => {
        fetch('/api/species', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(res => res.json())
            .then(data => setSpeciesList(data));

        fetch('/api/categories', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(res => res.json())
            .then(data => setCategoryList(data));
    }, []);

    const fetchProducts = async () => {
        const query = new URLSearchParams({
            archived: showArchived,
            species: speciesFilter,
            categoryId: categoryFilter,
            search: searchTerm
        });


        const res = await fetch(`/api/products?${query.toString()}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (res.ok) {
            const data = await res.json();
            setProducts(data);
        }
    };


    useEffect(() => {
        fetchProducts();
    }, [speciesFilter, categoryFilter, searchTerm, showArchived]);


    const handleEdit = (product) => setEditProduct(product);

    const handleDelete = async (id) => {
        if (window.confirm('Видалити товар остаточно?')) {
            await fetch(`/api/products/${id}`, {
                method: 'DELETE', headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            fetchProducts();
        }
    };

    const handleArchive = async (id) => {
        await fetch(`/api/products/${id}/archive`, {
            method: 'PATCH', headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        fetchProducts();
    };

    const handleRestore = async (id) => {
        await fetch(`/api/products/${id}/restore`, {
            method: 'PATCH', headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        fetchProducts();
    };

    const handleSave = async () => {
        setEditProduct(null);
        fetchProducts();
    };


    return (<div className="pharmacy-admin__container">
        <div className="pharmacy-admin__products">
            <div className={"pharmacy-admin__products-list-container"}>
                <h1>Управління товарами</h1>
                <div className={"pharmacy-admin__filters"}>
                    <div className={"pharmacy-admin__filter pharmacy-admin__species-filter"}>
                        <label>Вид тварини:</label>
                        <select
                            value={speciesFilter}
                            onChange={e => setSpeciesFilter(e.target.value)}>
                            <option value="">Універсальна</option>
                            {speciesList.map(s => (<option key={s._id} value={s._id}>{s.name}</option>))}
                        </select>
                    </div>
                    <div className={"pharmacy-admin__filter pharmacy-admin__category-filter"}>
                        <label>Категорія:</label>
                        <select
                            value={categoryFilter}
                            onChange={e => setCategoryFilter(e.target.value)}>
                            <option value="">Всі категорії</option>
                            {categoryList.map(c => (<option key={c._id} value={c._id}>{c.name}</option>))}
                        </select>
                    </div>
                    <Button className={"pharmacy-admin__button pharmacy-admin__display-button"}
                            onClick={() => setShowArchived(!showArchived)}
                            content={showArchived ? 'Показати активні' : 'Показати архівні'}>
                    </Button>

                </div>
                <div className={"pharmacy-admin__search"}>
                    <hr/>
                    <label>Пошук</label>
                    <div className={"pharmacy-admin__search-input"}>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Назва товару"
                        />
                        <Button onClick={e => {
                            e.preventDefault();
                            fetchProducts();
                        }}
                                content={"Пошук"}
                                className={"pharmacy-admin__button pharmacy-admin__display-button"}></Button>
                    </div>
                </div>
                <h2>Список товарів</h2>

                <div className={"pharmacy-admin__products-table-tbody"}>
                    <table className={"pharmacy-admin__products-table"} cellSpacing={0}>
                        <thead>
                        <tr>
                            <th>Назва</th>
                            <th>Тип тварини</th>
                            <th>Категорія</th>
                            <th>Ціна</th>
                            <th>Склад</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {products.length > 0 && products.map(p => (<tr key={p._id}>
                            <td className={"pharmacy-admin__name"}>{p.name}</td>
                            <td className={"pharmacy-admin__species"}>{p.speciesId?.name || 'Універсальний'}</td>
                            <td className={"pharmacy-admin__category"}>{p.category?.name || 'Загальні'}</td>
                            <td>{p.price}</td>
                            <td>{p.stock}</td>
                            <td className={"pharmacy-admin__buttons pharmacy-admin__product-buttons"}>

                                {showArchived ? (<div>
                                    <Button onClick={() => handleRestore(p._id)} content={"Відновити"}
                                            className={"pharmacy-admin__button pharmacy-admin__product-button pharmacy-admin__restore-button"}></Button>
                                    <Button onClick={() => handleDelete(p._id)} content={"Видалити"}
                                            className={"pharmacy-admin__button pharmacy-admin__product-button pharmacy-admin__delete-button"}></Button>
                                </div>) : (<div>
                                    <Button onClick={() => handleEdit(p)}
                                            className={"pharmacy-admin__button pharmacy-admin__product-button pharmacy-admin__edit-button"}
                                            content={"Редагувати"}></Button>
                                    <Button onClick={() => handleArchive(p._id)}
                                            className={"pharmacy-admin__button pharmacy-admin__product-button pharmacy-admin__archive-button"}
                                            content={"В архів"}></Button>
                                </div>)}
                            </td>
                        </tr>))}
                        </tbody>
                    </table>
                </div>

            </div>
            <div className={"pharmacy-admin__editing-products-container"}>
                <Category/>
                <ProductForm onSave={handleSave} existingProduct={editProduct}/>
            </div>
        </div>

    </div>);
}
