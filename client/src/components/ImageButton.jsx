import React from 'react';
import '../assets/styles/main.scss';


export default function ImageButton({className, source, alternative, onClick}) {
    return (
        <>
            <div className={`image-button ${className}`} >
                <img src={source} alt={alternative} onClick={onClick}/>
            </div>
        </>

    );
}
