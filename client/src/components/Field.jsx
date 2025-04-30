import React from 'react';
import '../assets/styles/main.scss';
import Header from "../layouts/Header";
import LeftMenu from "../layouts/LeftMenu";


export default function Field({className, title, placeholder, type}) {
    if (!type) type = 'text';
    return (
        <div className="field__container">
            <div className="field__title">
                {title}
            </div>
            <input className={`field__entering-area ${className}`} placeholder={placeholder} type={type}/>
        </div>

    );
}
