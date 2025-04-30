import React from 'react';
import '../assets/styles/main.scss';
import Field from "../components/Field";
import Button from "../components/Button";
import {useNavigate} from "react-router-dom";


export default function SignIn() {
    const navigate = useNavigate();
    return (
        <div className="sign-in__container">
            <div className="sign-in__info-container">
                <div className="sign-in__title">Sign in</div>
                <div className="sign-in__send-code-container">
                    <Field title="Email:" type="email" placeholder="name@gmail.com"></Field>
                    <Button className="sign-in__send-code-button" content={"Send code"}/>
                </div>
                <Field className="code-field" title="Code from email:" type="text"></Field>
                <Button className="sign-in__button" content={"Sign in"} onClick={() => {
                    navigate('/')
                }}/>
                <div className="sign-in__dont-have-account">
                    Don't have an account? <a href="/signup" className="red-href">Sign up</a>
                </div>
            </div>
            <div className="sign-in__logo-container">
                <img src="/assets/images/logo-large.png" alt="PetHealth Logo Large" className="sign-in__logo"/>
                <img src="/assets/images/name-large.png" alt="PetHealth Name Large" className="sign-in__name"/>
            </div>
        </div>
    );
}
