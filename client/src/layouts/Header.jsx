import React from 'react';
import '../assets/styles/main.scss';


export default function Header() {
    return (
        <div className="header">
            <div className="header__logo-container">
                <img src="/assets/images/logo-small.png" alt="PetHealth Logo" className="header__logo"/>
                <img src="/assets/images/name-small.png" alt="PetHealth" className="header__name"/>
            </div>
            <div className="header__default-user-avatar" id="header__user-avatar"></div>
        </div>
    );
}
