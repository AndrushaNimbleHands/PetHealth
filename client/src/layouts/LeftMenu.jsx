import React from 'react';
import '../assets/styles/main.scss';
import Button from "../components/Button";
import { useNavigate } from 'react-router-dom';



export default function LeftMenu({appointmentOnClick, petCardOnClick, pharmacyOnClick, ordersOnClick}) {
    const navigate = useNavigate();
    return (
        <div className="left-menu">
            <Button className="left-menu__button" content="Записатись на прийом" onClick={appointmentOnClick}/>
            <Button className="left-menu__button" content="Карта пацієнта" onClick={petCardOnClick}/>
            <Button className="left-menu__button" content="Вет-аптека" onClick={pharmacyOnClick}/>
            <Button className="left-menu__button" content="Мої замовлення" onClick={ordersOnClick}/>
        </div>
    );
}
