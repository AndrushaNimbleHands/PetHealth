import React, {useEffect, useState} from 'react';
import '../assets/styles/main.scss';
import Field from "../components/Field";
import Button from "../components/Button";
import {useNavigate} from "react-router-dom";
import {sendCodeSignIn, signIn} from "../services/authService";

export default function SignIn() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');
    const [cooldown, setCooldown] = useState(0);
    const [sendCount, setSendCount] = useState(() => parseInt(localStorage.getItem("sendCount")) || 0);
    const [blockUntil, setBlockUntil] = useState(() => parseInt(localStorage.getItem("blockUntil")) || 0);

    useEffect(() => {
        const now = Date.now();
        if (blockUntil && now >= blockUntil) {
            localStorage.removeItem("sendCount");
            localStorage.removeItem("blockUntil");
            setSendCount(0);
            setBlockUntil(0);
        }
    }, [blockUntil]);

    const handleSend = async () => {
        const now = Date.now();

        if (blockUntil && now < blockUntil) {
            const remaining = Math.ceil((blockUntil - now) / 1000 / 60);
            setError(`Перевищено кількість спроб. Спробуйте знову через ${remaining} хв.`);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            setError('Введіть коректну email-адресу');
            return;
        }

        try {
            await sendCodeSignIn(email);
            setSent(true);
            setError("");
            setCooldown(60);

            const interval = setInterval(() => {
                setCooldown(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            const newCount = sendCount + 1;
            setSendCount(newCount);
            localStorage.setItem("sendCount", newCount);

            if (newCount >= 5) {
                const blockUntilTime = now + 5 * 60 * 60 * 1000; // 5 годин
                setBlockUntil(blockUntilTime);
                localStorage.setItem("blockUntil", blockUntilTime);
            }
        } catch (e) {
            setError(e.message || 'Не вдалося надіслати код');
        }
    };

    const handleSignIn = async () => {
        try {
            const res = await signIn(email, code);
            localStorage.setItem("token", res.token);
            localStorage.setItem("role", res.role);
            if (res.role === 'admin' || res.role === 'doctor') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (e) {
            setError(e.message);
        }
    };

    return (
        <div className="sign-in__container">
            <div className="sign-in__info-container">
                <div className="sign-in__title">Авторизація</div>
                <div className="sign-in__send-code-container">
                    <Field
                        title="Email:"
                        type="email"
                        onChange={e => setEmail(e.target.value)}
                        placeholder="name@gmail.com"
                    />
                    {cooldown > 0 ? (
                        <div className="sign-in__cooldown-text">
                            Повторно через {Math.floor(cooldown / 60)}:{(cooldown % 60).toString().padStart(2, '0')}
                        </div>
                    ) : (
                        <Button className="sign-in__send-code-button" content={"Код"} onClick={handleSend}/>
                    )}
                </div>
                {sent && (
                    <>
                        <Field
                            className="code-field"
                            title="Код з email:"
                            type="text"
                            onChange={e => setCode(e.target.value)}
                        />
                        <Button className="sign-in__button" content={"Увійти"} onClick={handleSignIn}/>
                    </>
                )}
                {error && <p style={{color: "red"}}>{error}</p>}
                <div className="sign-in__dont-have-account">
                    Ще немає акаунту? <a href="/signup" className="red-href">Зареєструйся</a>
                </div>
            </div>
            <div className="sign-in__logo-container">
                <img src="/assets/images/logo-large.png" alt="PetHealth Logo Large" className="sign-in__logo"/>
                <img src="/assets/images/name-large.png" alt="PetHealth Name Large" className="sign-in__name"/>
            </div>
        </div>
    );
}
