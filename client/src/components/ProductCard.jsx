import React from 'react';
import {useCart} from '../context/CartContext';
import '../assets/styles/main.scss';
import Button from "./Button";

export default function ProductCard({product, isDetailed, onClose, onOpenDetails}) {
    const {addToCart} = useCart();

    return (
        <div className="product-card">
            <div className={"product-card__short-info"}>
                <h3>{product.name}</h3>
                <p>{product.shortDescription}</p>
                <p className={"price"}>{product.price} грн / {product.unit}</p>
                <p>{product.isPrescriptionFree ? 'Без рецепту' : 'За рецептом'}</p>
                <p><strong>{product.stock === 0 ? 'Немає в наявності' : ''}</strong></p>
                <p><strong>{product.stock > 0 && product.stock <=5  ? 'Закінчується' : ''}</strong></p>
            </div>
            {isDetailed && (
                <div className="product-card__details">
                    <p><strong>Опис:</strong> {product.longDescription}</p>
                    <p><strong>Категорія:</strong> {product.categoryId?.name}</p>
                    <p><strong>Вид тварини:</strong> {product.speciesId?.name}</p>
                    <div className="product-card__buttons">
                        <Button className={"product-card__button product-card__close-button"} onClick={onClose}
                                content={"Сховати"}></Button>
                    </div>
                </div>)}
            <div className="product-card__buttons">
                {!isDetailed && (
                    <Button className={"product-card__button product-card__details-button"} onClick={onOpenDetails}
                            content={"Детальніше"}></Button>
                )}
                {
                    product.stock > 0 &&
                    <Button className={"product-card__button product-card__to-cart-button"}
                            onClick={() => addToCart(product)} content={"Додати до кошика"}></Button>
                }
            </div>

            <hr/>
        </div>
    );
}
