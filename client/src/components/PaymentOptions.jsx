import React from 'react';
import '../assets/styles/main.scss';

export default function PaymentOptions({ deliveryMethod, paymentMethod, setPaymentMethod }) {
    const isCodAvailable = deliveryMethod === 'np_branch' || deliveryMethod === 'np_postomat';
    const isCourier = deliveryMethod === 'np_courier';
    const isPickup = deliveryMethod === 'pickup';

    if (isPickup) {
        return (
            <div className="payment-options">
                <p></p>
                <h3>Оплата</h3>
                <p>Оплата на місці при отриманні</p>
            </div>
        );
    }

    return (
        <div className="payment-options__container">
            <p></p>
            <h3>Оплата</h3>

            {isCodAvailable && (
                <label>
                    <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                    />
                    Накладений платіж (оплата при отриманні у відділенні/поштоматі)
                </label>
            )}

            {isCourier && (
                <>
                    <label>
                        <input
                            type="radio"
                            name="paymentMethod"
                            value="cash"
                            checked={paymentMethod === 'cash'}
                            onChange={() => setPaymentMethod('cash')}
                        />
                        Готівкою курʼєру
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="paymentMethod"
                            value="card"
                            checked={paymentMethod === 'card'}
                            onChange={() => setPaymentMethod('card')}
                        />
                        Карткою курʼєру
                    </label>
                </>
            )}
        </div>
    );
}
