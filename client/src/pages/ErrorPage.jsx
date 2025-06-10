import React, {useState} from 'react';
import '../assets/styles/main.scss';
import Header from "../layouts/Header";
import Button from "../components/Button";
import LeftMenu from "../layouts/LeftMenu";
import SideBar from "../layouts/SideBar";
import {useNavigate} from "react-router-dom";


export default function ErrorPage() {
    const navigate = useNavigate();
    return (
        <div className="error-page__container">
            <div className="error-header">
                <div className="header__logo-container">
                    <img src="/assets/images/logo-small.png" alt="PetHealth Logo" className="header__logo"/>
                    <img src="/assets/images/name-small.png" alt="PetHealth" className="header__name"/>
                </div>
            </div>
            <div className="error-text">
                <p>
                    Error 404: Page Not Found
                </p>
                <hr className={"error-hr"}/>
                <p>
                    Помилка 404: Сторінка Не Знайдена
                </p>
            </div>
            <div className="error-page__back-button__container">
                <Button className={"error-page__back-button"}
                        onClick={() => navigate(-1)}
                        content={"Назад"}></Button>
            </div>

        </div>


    );
}
