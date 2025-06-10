import React, {useState} from 'react';
import '../assets/styles/main.scss';
import SideBar from "./SideBar";
import ImageButton from "../components/ImageButton";


export default function Header({className}) {

    const [isOpen, setOpen] = useState(false);
    return (
        <div className={`header ${className}`}>
            <div className={`header__logo-container ${className}`}>
                <img src="/assets/images/logo-small.png" alt="PetHealth Logo" className="header__logo"/>
                <img src="/assets/images/name-small.png" alt="PetHealth" className="header__name"/>
            </div>
            <div className="header__side-bar-button"
                 onClick={() => {
                     setOpen(!isOpen);
                     console.log(isOpen)
                 }}>
                <span></span>
                <span></span>
                <span></span>
            </div>
            <div className={`side-bar__container ${isOpen ? 'side-bar__container-open' : ""}`}>
                <SideBar className={className} onCLick={() => setOpen(!isOpen)} isOpen={isOpen}></SideBar>
            </div>

        </div>
    );
}
