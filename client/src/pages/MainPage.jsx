import React from 'react';
import '../assets/styles/main.scss';
import Header from "../layouts/Header";
import Button from "../components/Button";
import LeftMenu from "../layouts/LeftMenu";


export default function MainPage() {
    return (
        <div className="container">
            <Header/>
            <div className="main-page__container">
                <LeftMenu>

                </LeftMenu>
                <div></div>
                {/*<div className="main-page__right-panel">*/}
                {/*    <div className="owner-info">*/}
                {/*        <div>ПІБ Власника</div>*/}
                {/*        <div>Ім'я тварини</div>*/}
                {/*    </div>*/}
                {/*    <div className="avatar"></div>*/}
                {/*</div>*/}
            </div>
        </div>

    );
}
