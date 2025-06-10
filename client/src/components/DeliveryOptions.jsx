import React from 'react';
import '../assets/styles/main.scss';


export default function DeliveryOptions({ delivery, setDelivery }) {
    const handleChange = (type, field, value) => {
        setDelivery(prev => ({
            ...prev,
            method: type,
            [field]: value
        }));
    };

    return (
        <div className="delivery-options__container">
            <h3>Доставка</h3>
            <label>
                <input
                    type="radio"
                    name="deliveryMethod"
                    value="pickup"
                    checked={delivery.method === 'pickup'}
                    onChange={() => setDelivery({ method: 'pickup', city: '', address: '' })}
                />
                Самовивіз з клініки
            </label>
            <label>
                <input
                    type="radio"
                    name="deliveryMethod"
                    value="np_branch"
                    checked={delivery.method === 'np_branch'}
                    onChange={() => setDelivery({ method: 'np_branch', city: '', branch: '' })}
                />
                Доставка у відділення Нової Пошти
            </label>
            {delivery.method === 'np_branch' && (
                <>
                    <input
                        type="text"
                        placeholder="Місто (та область)"
                        value={delivery.city || ''}
                        onChange={e => handleChange('np_branch', 'city', e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="№ відділення"
                        value={delivery.branch || ''}
                        onChange={e => handleChange('np_branch', 'branch', e.target.value)}
                    />
                </>
            )}
            <label>
                <input
                    type="radio"
                    name="deliveryMethod"
                    value="np_postomat"
                    checked={delivery.method === 'np_postomat'}
                    onChange={() => setDelivery({ method: 'np_postomat', city: '', postomat: '' })}
                />
                Доставка у поштомат Нової Пошти
            </label>
            {delivery.method === 'np_postomat' && (
                <>
                    <input
                        type="text"
                        placeholder="Місто (та область)"
                        value={delivery.city || ''}
                        onChange={e => handleChange('np_postomat', 'city', e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="№ поштомату"
                        value={delivery.postomat || ''}
                        onChange={e => handleChange('np_postomat', 'postomat', e.target.value)}
                    />
                </>
            )}
            <label>
                <input
                    type="radio"
                    name="deliveryMethod"
                    value="np_courier"
                    checked={delivery.method === 'np_courier'}
                    onChange={() => setDelivery({ method: 'np_courier', city: '', address: '' })}
                />
                Курʼєр Нової Пошти на адресу
            </label>
            {delivery.method === 'np_courier' && (
                <>
                    <input
                        type="text"
                        placeholder="Місто (та область)"
                        value={delivery.city || ''}
                        onChange={e => handleChange('np_courier', 'city', e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Адреса доставки"
                        value={delivery.address || ''}
                        onChange={e => handleChange('np_courier', 'address', e.target.value)}
                    />
                </>
            )}
        </div>
    );
}
