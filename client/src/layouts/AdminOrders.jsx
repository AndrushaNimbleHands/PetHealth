import React, {useEffect, useState} from 'react';
import '../assets/styles/main.scss';
import Button from "../components/Button";


export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchNumber, setSearchNumber] = useState('');


    useEffect(() => {
        fetch('/api/admin/orders', {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('token')
            }
        })
            .then(res => res.json())
            .then(data => {
                console.log('✅ Orders from backend:', data);
                if (Array.isArray(data)) {
                    const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setOrders(sorted);
                } else {
                    console.error('❌ Отримано не масив:', data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Помилка отримання замовлень:', err);
                setLoading(false);
            });
    }, []);

    const handleEditClick = () => {
        setEditData({
            status: selectedOrder.status,
            paymentMethod: selectedOrder.paymentMethod,
            city: selectedOrder.delivery?.city || '',
            deliveryType: selectedOrder.delivery?.type || '',
            deliveryAddress: selectedOrder.delivery?.address || '',
        });
        setIsEditing(true);
    };

    const handleSave = async () => {
        const res = await fetch(`/api/admin/orders/${selectedOrder._id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({
                status: editData.status,
                paymentMethod: editData.paymentMethod,
                delivery: {
                    type: editData.deliveryType,
                    city: editData.city,
                    address: editData.deliveryAddress
                }
            })
        });

        if (res.ok) {
            const updated = await res.json();
            setOrders(prev => prev.map(o => o._id === updated._id ? updated : o));
            setSelectedOrder(updated);
            setIsEditing(false);
        } else {
            alert('Помилка збереження змін');
        }
    };

    if (loading) return <p>Завантаження...</p>;

    return (
        <div className="admin-orders-container">
            {!selectedOrder ? <h1>Список замовлень</h1> : <h1>Замовлення №{selectedOrder.orderNumber}</h1>}
            {!selectedOrder &&
                <>
                    <div className="admin-orders__filter">
                        <label>Фільтр за статусом: </label>
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                            <option value="">Усі</option>
                            <option value="pending">🕒 В обробці</option>
                            <option value="shipping">🚚 Передано в доставку</option>
                            <option value="completed">✅ Завершено</option>
                            <option value="cancelled">❌ Скасовано</option>
                        </select>
                    </div>
                    <div className="admin-orders__search">
                        <label>Пошук за номером: </label>
                        <input
                            type="text"
                            value={searchNumber}
                            onChange={e => setSearchNumber(e.target.value)}
                            placeholder="Введіть номер замовлення"
                        />
                    </div>
                </>

            }
            {!selectedOrder ? (
                <div className="admin-orders__orders-list">
                    {orders
                        .filter(order =>
                            (!statusFilter || order.status === statusFilter) &&
                            (!searchNumber || order.orderNumber.toLowerCase().includes(searchNumber.toLowerCase()))
                        )
                        .map(order => (

                            <div key={order._id} className="admin-order__item-container">
                                <div className="admin-order__item">
                                    <div className="admin-order__item-info">
                                        <h3><strong>№ замовлення:</strong> {order.orderNumber}</h3>
                                        <p>
                                            <strong>Дата:</strong> {new Date(order.createdAt).toLocaleDateString('uk-UA')}
                                        </p>
                                        <p><strong>Сума:</strong> {order.total} грн</p>
                                        <p><strong>Статус:</strong> {
                                            {
                                                pending: 'В обробці',
                                                shipping: 'Передано в доставку',
                                                completed: 'Завершено',
                                                cancelled: 'Скасовано'
                                            }[order.status] || order.status
                                        }</p>
                                    </div>
                                    <div className={"admin-order__buttons"}>
                                        <Button className={"admin-orders__button admin-orders__details-button"}
                                                onClick={() => setSelectedOrder(order)} content={"Детальніше"}></Button>
                                    </div>
                                </div>

                                <hr/>
                            </div>
                        ))}
                </div>
            ) : (
                <div className="admin-order-details">
                    <p><strong>Дата:</strong> {new Date(selectedOrder.createdAt).toLocaleString('uk-UA')}</p>
                    <p><strong>Сума:</strong> {selectedOrder.total} грн</p>

                    {isEditing ? (
                        <div className={"admin-order__editing-container"}>
                            <p>
                                <strong>Користувач:</strong> {selectedOrder.userId?.firstName || '—'} {selectedOrder.userId?.lastName || ''}
                            </p>
                            <p><strong>Email:</strong> {selectedOrder.userId?.email || '—'}</p>
                            <p><strong>Телефон:</strong> {selectedOrder.userId?.phone || '—'}</p>
                            <div className={"admin-order__editing"}>
                                <div className={"admin-order__editing-field"}>
                                    <label>Статус:</label>
                                    <select value={editData.status}
                                            onChange={e => setEditData({...editData, status: e.target.value})}>
                                        <option value="pending">🕒 В обробці</option>
                                        <option value="shipping">🚚 Передано в доставку</option>
                                        <option value="completed">✅ Завершено</option>
                                        <option value="cancelled">❌ Скасовано</option>
                                    </select>
                                </div>
                                <div className={"admin-order__editing-field"}>
                                    <label>Оплата:</label>
                                    <select value={editData.paymentMethod}
                                            onChange={e => setEditData({
                                                ...editData,
                                                paymentMethod: e.target.value
                                            })}>
                                        <option value="cash">Готівка</option>
                                        <option value="card">Картка</option>
                                        <option value="cod">Накладений платіж</option>
                                    </select>
                                </div>
                                <div className={"admin-order__editing-field"}>
                                    <label>Тип доставки:</label>
                                    <select value={editData.deliveryType}
                                            onChange={e => setEditData({...editData, deliveryType: e.target.value})}>
                                        <option value="pickup">Самовивіз</option>
                                        <option value="np_branch">Нова Пошта (відділення)</option>
                                        <option value="np_postamat">Нова Пошта (поштомат)</option>
                                        <option value="np_address">Курʼєр НП (адреса)</option>
                                    </select>
                                </div>
                                <div className={"admin-order__editing-field"}>
                                    <label>Місто:</label>
                                    <input type="text" value={editData.city}
                                           onChange={e => setEditData({...editData, city: e.target.value})}/>
                                </div>
                                <div className={"admin-order__editing-field"}>
                                    <label>Адреса / відділення / поштомат: </label>
                                    <input type="text" value={editData.deliveryAddress} placeholder={""}
                                           onChange={e => setEditData({...editData, deliveryAddress: e.target.value})}/>
                                </div>

                            </div>
                            <div className={"admin-order__editing-buttons"}>
                                <Button className={"admin-orders__button admin-orders__save-button"}
                                        onClick={handleSave} content={"Зберегти"}></Button>
                                <Button className={"admin-orders__button admin-orders__cancel-button"}
                                        onClick={() => setIsEditing(false)} content={"Скасувати"}></Button>
                            </div>

                        </div>
                    ) : (
                        <>
                            <p>
                                <strong>Користувач:</strong> {selectedOrder.userId?.firstName || '—'} {selectedOrder.userId?.lastName || ''}
                            </p>
                            <p><strong>Email:</strong> {selectedOrder.userId?.email || '—'}</p>
                            <p><strong>Телефон:</strong> {selectedOrder.userId?.phone || '—'}</p>

                            <p><strong>Статус:</strong> {
                                {
                                    pending: 'В обробці',
                                    shipping: 'Передано в доставку',
                                    completed: 'Завершено',
                                    cancelled: 'Скасовано'
                                }[selectedOrder.status] || selectedOrder.status
                            }</p>
                            <p><strong>Оплата:</strong> {
                                {
                                    cash: 'Готівка',
                                    card: 'Картка',
                                    cod: 'Накладений платіж'
                                }[selectedOrder.paymentMethod] || selectedOrder.paymentMethod
                            }</p>
                            <p><strong>Тип доставки:</strong> {
                                {
                                    pickup: 'Самовивіз',
                                    np_branch: 'Нова Пошта (відділення)',
                                    np_postamat: 'Нова Пошта (поштомат)',
                                    np_address: 'Курʼєр НП (адреса)'
                                }[selectedOrder.delivery?.method] || '—'
                            }</p>
                            <p><strong>Місто:</strong> {selectedOrder.delivery?.city || '—'}</p>

                            <p><strong>Адреса / відділення / поштомат:</strong> {
                                selectedOrder.delivery?.branch || selectedOrder.delivery?.address || '—'
                            }</p>

                            <p><strong>Товари:</strong></p>
                            <ul>
                                {selectedOrder.items.map((item, idx) => (
                                    <li key={idx}>
                                        {item.productId?.name || '—'} — {item.quantity} × {item.productId?.price} грн
                                    </li>
                                ))}
                            </ul>
                            <div className={"admin-order__detail-buttons"}>
                                <Button className={"admin-orders__button admin-orders__edit-button"}
                                        onClick={handleEditClick} content={"Редагувати"}></Button>
                                <Button className={"admin-orders__button admin-orders__back-button"}
                                        onClick={() => setSelectedOrder(null)} content={"Назад"}></Button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
