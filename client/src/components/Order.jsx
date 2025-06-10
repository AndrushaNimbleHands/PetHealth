import React, { useEffect, useState } from 'react';
import '../assets/styles/main.scss';

export default function Order() {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchNumber, setSearchNumber] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        fetch('/api/shop/orders', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setOrders(sorted);
                setFilteredOrders(sorted);
                setLoading(false);
            })
            .catch(err => {
                console.error('Помилка завантаження замовлень:', err);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        let filtered = [...orders];

        if (statusFilter) {
            filtered = filtered.filter(o => o.status === statusFilter);
        }

        if (searchNumber.trim()) {
            filtered = filtered.filter(o => o.orderNumber.toLowerCase().includes(searchNumber.toLowerCase()));
        }

        setFilteredOrders(filtered);
    }, [statusFilter, searchNumber, orders]);

    if (loading) return <p>Завантаження замовлень...</p>;
    if (filteredOrders.length === 0) return <p>Замовлення не знайдено.</p>;

    return (
        <div className="order">
            <h1>Мої замовлення</h1>
            <div className="orders__filters">
                <label>
                    Статус:
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="">Усі</option>
                        <option value="pending">⏰ В обробці</option>
                        <option value="shipping">🚚 В доставці</option>
                        <option value="completed">✅ Завершено</option>
                        <option value="cancelled">❌ Скасовано</option>
                    </select>
                </label>

                <label>
                    Пошук за номером:
                    <input
                        type="text"
                        placeholder="Номер замовлення"
                        value={searchNumber}
                        onChange={e => setSearchNumber(e.target.value)}
                    />
                </label>
            </div>

            <div className="orders__container">
                {filteredOrders.map(order => (
                    <div key={order._id} className="order-item__container">
                        <div className="order-item">
                            <div className="order-item__info">
                                <h3><strong>Номер замовлення:</strong> {order.orderNumber}</h3>
                                <p><strong>Дата:</strong> {new Date(order.createdAt).toLocaleString('uk-UA')}</p>
                                <p><strong>Сума:</strong> {order.total} грн</p>
                                <p><strong>Статус:</strong> {
                                    {
                                        completed: '✅ Завершено',
                                        cancelled: '❌ Скасовано',
                                        shipping: '🚚 Передано в доставку',
                                        pending: '⏰ В обробці'
                                    }[order.status] || order.status
                                }</p>
                                <p><strong>Оплата:</strong> {
                                    {
                                        cash: 'Готівка',
                                        card: 'Картка курʼєру',
                                        cod: 'Накладений платіж'
                                    }[order.paymentMethod] || order.paymentMethod
                                }</p>
                                <p><strong>Доставка:</strong> {
                                    {
                                        pickup: 'Самовивіз з клініки',
                                        np_branch: `Нова Пошта (відділення №${order.delivery.branch}, ${order.delivery.city})`,
                                        np_postomat: `Нова Пошта (поштомат ${order.delivery.postomat}, ${order.delivery.city})`,
                                        np_courier: `Курʼєр НП (${order.delivery.city}, ${order.delivery.address})`
                                    }[order.delivery.method] || '—'
                                }</p>
                            </div>
                            <div className="order-item__products">
                                <p><strong>Товари:</strong></p>
                                <ul>
                                    {order.items.map((item, idx) => (
                                        <li key={idx}>
                                            {item.productId?.name || '—'} — {item.quantity} × {item.productId?.price} грн
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <hr />
                    </div>
                ))}
            </div>
        </div>
    );
}
