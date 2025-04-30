import React from 'react';
import '../assets/styles/main.scss';
import Field from "../components/Field";
import Button from "../components/Button";
import {useNavigate} from "react-router-dom";



export default function SignUp() {
    const navigate = useNavigate();
    return (
        <div className="sign-up__container">
            <div className="sign-up__info-container">
                <div className="sign-up__title">Sign up</div>
                <Field title="Phone number:" type="tel" placeholder="+38 (099) 000 11 22"></Field>
                <div className="sign-up__send-code-container">
                    <Field title="Email:" type="email" placeholder="name@gmail.com"></Field>
                    <Button className="sign-up__send-code-button" content={"Send code"}/>
                </div>
                <Field className="password-field" title="Code from email:" type="text"></Field>
                <Button className="sign-up__button" content={"Sign up"} onClick={() => {navigate('/')}}/>
                <div className="sign-up__have-account">
                    Already have an account? <a href="/signin" className="red-href">Sign in</a>
                </div>
            </div>
            <div className="sign-up__logo-container">
                <img src="/assets/images/logo-large.png" alt="PetHealth Logo Large" className="sign-up__logo"/>
                <img src="/assets/images/name-large.png" alt="PetHealth Name Large" className="sign-up__name"/>
            </div>
        </div>
    );
}
