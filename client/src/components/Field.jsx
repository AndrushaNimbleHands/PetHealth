import React from 'react';
import '../assets/styles/main.scss';
import Header from "../layouts/Header";
import LeftMenu from "../layouts/LeftMenu";


export default function Field({className, classNameTitle, title, placeholder, type, onChange, value, lang, min, disabled}) {
    if (!type) type = 'text';
    return (
        <div className={`field__container` + `__${className}`}>
            <div className={`field__title ${classNameTitle}`}>
                {title}
            </div>
            <input className={`field__entering-area ${className}`}
                   placeholder={placeholder}
                   type={type}
                   onChange={onChange}
                   value={value}
                   lang={lang}
                   min={min}
                   disabled={disabled}/>
        </div>

    );
}
