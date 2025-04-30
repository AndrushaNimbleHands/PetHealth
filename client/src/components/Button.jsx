import React from 'react';
import '../assets/styles/main.scss';


export default function Button({className, content, onClick}) {
    return (
        <div className={`button ${className}`} onClick={onClick}>
            {content}
        </div>
    );
}
