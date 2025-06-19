import React, { useEffect, useState } from 'react';
import '../assets/styles/main.scss';
import Field from "../components/Field";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import { sendCode, signUp } from "../services/authService";

export default function SignUp() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [phone, setPhone] = useState('');
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');
    const [cooldown, setCooldown] = useState(0);
    const [sendCount, setSendCount] = useState(() => parseInt(localStorage.getItem("signUpSendCount")) || 0);
    const [blockUntil, setBlockUntil] = useState(() => parseInt(localStorage.getItem("signUpBlockUntil")) || 0);

    useEffect(() => {
        const now = Date.now();
        if (blockUntil && now >= blockUntil) {
            localStorage.removeItem("signUpSendCount");
            localStorage.removeItem("signUpBlockUntil");
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
        const phoneRegex = /^\+380\d{9}$/;

        if (!emailRegex.test(email.trim())) {
            setError('Введіть коректну email-адресу');
            return;
        }
        if (!phoneRegex.test(phone.trim())) {
            setError('Введіть номер телефону у форматі +380XXXXXXXXX');
            return;
        }

        try {
            await sendCode(email);
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
            localStorage.setItem("signUpSendCount", newCount);

            if (newCount >= 5) {
                const blockUntilTime = now + 5 * 60 * 60 * 1000; // 5 годин
                setBlockUntil(blockUntilTime);
                localStorage.setItem("signUpBlockUntil", blockUntilTime);
            }
        } catch (e) {
            setError(e.message || 'Не вдалося надіслати код');
        }
    };

    const handleSignUp = async () => {
        try {
            const res = await signUp(email, phone, code);
            localStorage.setItem("token", res.token);
            localStorage.setItem("role", res.role);

            if (res.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        }
        catch (e) {
            setError(e.message || 'Помилка при реєстрації');
        }
    };

    return (
        <div className="sign-up__container">
            <div className="sign-up__info-container">
                <div className="sign-up__title">Реєстрація</div>

                <Field
                    title="Номер телефону:"
                    type="tel"
                    placeholder="+380XXXXXXXXX"
                    onChange={e => setPhone(e.target.value)}
                />

                <div className="sign-up__send-code-container">
                    <Field
                        title="Email:"
                        type="email"
                        placeholder="name@gmail.com"
                        onChange={e => setEmail(e.target.value)}
                    />
                    {cooldown > 0 ? (
                        <div className="sign-up__cooldown-text">
                            Повторно через {Math.floor(cooldown / 60)}:{(cooldown % 60).toString().padStart(2, '0')}
                        </div>
                    ) : (
                        <Button className="sign-up__send-code-button" content={"Код"} onClick={handleSend} />
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
                        <Button className="sign-up__button" content={"Зареєструватись"} onClick={handleSignUp} />
                    </>
                )}

                {error && <p style={{ color: "red" }}>{error}</p>}

                <div className="sign-up__have-account">
                    Вже маєш акаунт? <a href="/signin" className="red-href">Увійди</a>
                </div>
            </div>

            <div className="sign-up__logo-container">
                <img src="/assets/images/logo-large.png" alt="PetHealth Logo Large" className="sign-up__logo" />
                <img src="/assets/images/name-large.png" alt="PetHealth Name Large" className="sign-up__name" />
            </div>
        </div>
    );
}
