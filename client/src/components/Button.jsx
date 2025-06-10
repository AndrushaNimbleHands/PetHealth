import React from 'react';
import '../assets/styles/main.scss';


export default function Button({className, content, onClick, key, disabled}) {
    return (
        <div className={`button ${className}`} onClick={!disabled ? onClick : null} key={key}>
            {content}
        </div>
    );
}
