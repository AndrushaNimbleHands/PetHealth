import React, {useEffect, useState} from 'react';
import {useCart} from '../context/CartContext';
import DeliveryOptions from './DeliveryOptions';
import PaymentOptions from './PaymentOptions';
import '../assets/styles/main.scss';
import Button from "./Button";

export default function Cart() {
    const {cart, removeFromCart, clearCart} = useCart();
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [delivery, setDelivery] = useState({method: 'pickup'});

    const [prescriptionProducts, setPrescriptionProducts] = useState([]);
    const [availableRecipes, setAvailableRecipes] = useState([]);
    const [selectedRecipes, setSelectedRecipes] = useState({});
    const [showRecipeModal, setShowRecipeModal] = useState(false);

    useEffect(() => {
        if (delivery.method === 'np_branch' || delivery.method === 'np_postomat') {
            setPaymentMethod('cod');
        } else if (delivery.method === 'pickup' || delivery.method === 'np_courier') {
            setPaymentMethod('cash');
        }
    }, [delivery.method]);

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const submitOrder = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) return alert('Увійдіть, щоб оформити замовлення');

            const userId = JSON.parse(atob(token.split('.')[1])).id;

            const prescriptionItems = cart.filter(item => !item.isPrescriptionFree);
            if (prescriptionItems.length > 0 && Object.keys(selectedRecipes).length === 0) {
                const res = await fetch('/api/recipes/client', {
                    headers: {Authorization: 'Bearer ' + token}
                });
                const data = await res.json();
                console.log(data);
                setPrescriptionProducts(prescriptionItems);
                setAvailableRecipes(data);
                setShowRecipeModal(true);
                setLoading(false);
                return;
            }

            const response = await fetch('/api/shop/order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId,
                    items: cart.map(item => ({
                        productId: item._id,
                        quantity: item.quantity
                    })),
                    delivery,
                    paymentMethod,
                    recipes: selectedRecipes
                })
            });

            const result = await response.json();

            if (!response.ok) throw new Error(result.error || 'Помилка при оформленні');

            alert('✅ Замовлення успішно оформлено!');
            clearCart();
            setShowConfirm(false);
            setShowRecipeModal(false);
            setSelectedRecipes({});
        } catch (e) {
            alert(`❌ ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleRecipeSelect = (productId, recipeId) => {
        setSelectedRecipes(prev => ({
            ...prev,
            [productId]: recipeId
        }));
    };

    return (
        <div className="cart-container">
            <h2>Кошик</h2>

            {cart.length === 0 ? (
                <p>Кошик порожній</p>
            ) : (
                <div className={"cart__items"}>
                    {cart.map(item => (
                        <div className={"cart-item"} key={item._id}>
                            {item.name} — {item.quantity}
                            <Button className={"cart__button cart__delete-item-button"}
                                    onClick={() => removeFromCart(item._id)} content={"×"}></Button>
                        </div>
                    ))}
                    <p className={"cart__total"}>Сума: {total} грн</p>
                    <DeliveryOptions delivery={delivery} setDelivery={setDelivery}/>
                    <PaymentOptions
                        deliveryMethod={delivery.method}
                        paymentMethod={paymentMethod}
                        setPaymentMethod={setPaymentMethod}
                    />

                    <div className="cart__buttons">
                        {!showConfirm ? (
                            <Button className={"cart__button cart__confirm-button"} onClick={() => setShowConfirm(true)}
                                    content={"Оформити замовлення"}></Button>
                        ) : (
                            <div className="cart__buttons">
                                <p className={"cart__confirmation"}>Підтвердити замовлення на {total} грн?</p>
                                <Button className={"cart__button cart__submit-button"} onClick={submitOrder}
                                        disabled={loading} content={loading ? 'Обробка...' : 'Підтвердити'}>
                                </Button>
                                <Button className={"cart__button cart__cancel-button"}
                                        onClick={() => setShowConfirm(false)} content={"Скасувати"}></Button>
                            </div>
                        )}
                    </div>

                </div>
            )}

            {showRecipeModal && (
                <div className="cart__recipe-container">
                    <div className="cart__recipe-selector">
                        <h3>Виберіть рецепт для кожного препарату:</h3>
                        {prescriptionProducts.map(prod => (
                            <div key={prod._id}>
                                <p><strong>{prod.name}</strong></p>
                                <select
                                    value={selectedRecipes[prod._id] || ''}
                                    onChange={e => handleRecipeSelect(prod._id, e.target.value)}
                                >
                                    <option value="" disabled={true}>Оберіть рецепт</option>
                                    {availableRecipes.map(r => (
                                        <option key={r._id} value={r._id}>
                                            #{r.recipeNumber} — {r.products.map(p => `${p.productId.name} × ${p.quantity}`).join(', ')}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>
                    <div className="cart__recipe-buttons">
                        <Button
                            onClick={() => {
                                const allSelected = prescriptionProducts.every(p => selectedRecipes[p._id]);
                                if (!allSelected) return alert('Виберіть рецепт для кожного препарату');
                                setShowRecipeModal(false);
                                setShowConfirm(true);
                            }}
                            className={"cart__button cart__submit-button"}
                            content={"Підтвердити рецепти"}>
                        </Button>
                        <Button
                            className={"cart__button cart__cancel-button"}
                            onClick={() => setShowRecipeModal(false)}
                            content={"Скасувати"}></Button>
                    </div>

                </div>
            )}
        </div>
    );
}
