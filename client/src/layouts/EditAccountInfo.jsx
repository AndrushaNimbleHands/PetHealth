import React, { useState } from 'react';
import '../assets/styles/main.scss';
import Button from "../components/Button";
import Field from "../components/Field";
import FieldPhone from "../components/FieldPhone";

export default function EditAccountInfo({ email, phone, handleEditAccountInfo, onChangeEmail, isAdmin }) {
    const [phoneToConfirm, setPhoneToConfirm] = useState('');
    const [showConfirmCode, setShowConfirmCode] = useState(false);
    const [code, setCode] = useState('');


    const handleSave = async () => {
        if (phone !== phoneToConfirm && phoneToConfirm !== '') {
            const res = await fetch('/api/user/send-phone-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify({ newPhone: phoneToConfirm })
            });

            if (res.ok) {
                alert('На ваш email надіслано код підтвердження зміни номера телефону.');
                setShowConfirmCode(true);
            } else {
                const err = await res.json();
                alert('Помилка: ' + err.error);
            }
        } else {
            await fetch('/api/user/account', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify({ email })
            });
            handleEditAccountInfo();
            alert("Дані для входу оновлено!");
        }
    };

    const handleConfirmCode = async () => {
        const res = await fetch('/api/user/confirm-phone-change', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({ code, newPhone: phoneToConfirm })
        });
        if (res.ok) {
            alert('Номер телефону успішно змінено!');
            setShowConfirmCode(false);
            setCode('');
            handleEditAccountInfo();
        } else {
            const err = await res.json();
            alert('Помилка: ' + err.error);
        }
    };

    return (
        <div>
            <Field
                className={"edit-account-info__email"}
                classNameTitle={"edit-info-title"}
                title={"Email"}
                value={email}
                onChange={onChangeEmail}
                type={"text"}
                disabled={!isAdmin}
            />
            {!isAdmin && (
                <p style={{ fontSize: '18px', color: '#666', marginTop: '4px' }}>
                    Для зміни пошти зверніться до адміністратора
                </p>
            )}

            {!showConfirmCode && (
                <FieldPhone
                    className={"edit-account-info__phone"}
                    classNameTitle={"edit-info-title"}
                    title={"Номер телефону"}
                    value={phoneToConfirm || phone}
                    onChange={e => setPhoneToConfirm(e.target.value)}
                    type={"tel"}
                />
            )}
            {showConfirmCode && (
                <Field
                    className={"edit-account-info__code"}
                    classNameTitle={"edit-info-title"}
                    title={"Введіть код підтвердження"}
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    type={"text"}
                />
            )}

            {!showConfirmCode ? (
                <>
                    <Button
                        className={"edit-info__button edit-account-info__save-button"}
                        onClick={handleSave}
                        content={"Зберегти"}
                    />
                    <Button
                        className={"edit-info__button edit-info__back-button edit-account-info__back-button"}
                        onClick={handleEditAccountInfo}
                        content={"Назад"}
                    />
                </>
            ) : (
                <>
                    <Button
                        className={"edit-info__button edit-account-info__save-button"}
                        onClick={handleConfirmCode}
                        content={"Підтвердити"}
                    />
                    <Button
                        className={"edit-info__button edit-info__back-button edit-account-info__back-button"}
                        onClick={() => {
                            setShowConfirmCode(false);
                            setCode('');
                        }}
                        content={"Скасувати"}
                    />
                </>
            )}
        </div>
    );
}
