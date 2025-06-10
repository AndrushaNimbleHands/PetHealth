import React, {useEffect, useState} from 'react';
import '../assets/styles/main.scss';
import Button from "../components/Button";
import Field from "../components/Field";


export default function EditUserInfo( {firstName, lastName, birthday, onChangeFirst, onChangeLast, onChangeBirthday, handleEditUserInfo} ) {

    const handleSave = async () => {
        await fetch('/api/user/me', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({
                firstName: firstName,
                lastName: lastName,
                birthday: new Date(birthday)
            })
        });
        handleEditUserInfo();
        alert("Дані користувача оновлено!")
    }

    const handleBack = () => {
        handleEditUserInfo();
    }

    return (
        <div className="edit-user-info">
            <Field className={"edit-user-info__first-name"} classNameTitle={"edit-info-title"} title={"Ім'я"}
                   value={firstName} onChange={onChangeFirst} type={"text"}></Field>
            <Field className={"edit-user-info__last-name"} classNameTitle={"edit-info-title"} title={"Прізвище"}
                   value={lastName} onChange={onChangeLast} type={"text"}></Field>
            <Field className={"edit-user-info__birthday"} classNameTitle={"edit-info-title"} title={"Дата народження (мм/дд/рррр)"}
                   value={birthday ? birthday.slice(0, 10) : ''} onChange={onChangeBirthday} type={"date"} lang="uk-UA" ></Field>
            <Button className={"edit-info__button edit-user-info__save-button"} onClick={handleSave} content={"Зберегти"}></Button>
            <Button className={"edit-info__button edit-info__back-button edit-user-info__back-button"} onClick={handleBack} content={"Назад"}></Button>
        </div>
    );
}
