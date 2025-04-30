import React from 'react';
import '../assets/styles/main.scss';
import Button from "../components/Button";
import { useNavigate } from 'react-router-dom';



export default function LeftMenu() {
    const navigate = useNavigate();
    return (
        <div className="left-menu">
            <Button className="left-menu__button" content="Записатись на прийом" onClick={() => navigate('/appointment')}/>
            <Button className="left-menu__button" content="Карта пацієнта" onClick={() => navigate('/card/patient?#id')}/>
            <Button className="left-menu__button" content="Вет-аптека" onClick={() => navigate('/pharmacy')}/>
            <Button className="left-menu__button" content="Exit (TEST)" onClick={() => navigate('/signin')}/>
        </div>
    );
}
