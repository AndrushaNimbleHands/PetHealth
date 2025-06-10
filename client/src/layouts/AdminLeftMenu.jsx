import React from 'react';
import '../assets/styles/main.scss';
import Button from "../components/Button";
import { useNavigate } from 'react-router-dom';

export default function AdminLeftMenu({
                                          appointmentOnClick,
                                          petCardOnClick,
                                          usersOnClick,
                                          proceduresOnClick,
                                          scheduleOnClick,
                                          vetPharmacyOnClick,
                                          ordersOnClick
                                      }) {
    const role = localStorage.getItem('role');

    return (
        <div className="left-menu">

            <Button className="left-menu__button admin" content="Прийоми" onClick={appointmentOnClick}/>
            <Button className="left-menu__button admin" content="Картки пацієнтів" onClick={petCardOnClick}/>
            <Button className="left-menu__button admin" content="Процедури" onClick={proceduresOnClick}/>
            {role === 'admin' && (
                <>
                    <Button className="left-menu__button admin" content="Вет-аптека" onClick={vetPharmacyOnClick}/>
                    <Button className="left-menu__button admin" content="Замовлення" onClick={ordersOnClick}/>
                    <Button className="left-menu__button admin" content="Розклад" onClick={scheduleOnClick}/>
                    <Button className="left-menu__button admin" content="Користувачі" onClick={usersOnClick}/>
                </>
            )}
        </div>
    );
}
