import React, {useEffect, useState} from 'react';
import '../assets/styles/main.scss';
import Button from "../components/Button";
import ImageButton from "../components/ImageButton";
import {useNavigate} from 'react-router-dom';
import EditUserInfo from "./EditUserInfo";
import EditAccountInfo from "./EditAccountInfo";
import EditPetCardInfo from "./EditPetCardInfo";


export default function SideBar({onCLick, isOpen, className}) {
    const navigate = useNavigate();
    const [isEditUserInfo, setIsEditUserInfo] = useState(false);
    const [isEditAccountInfo, setIsEditAccountInfo] = useState(false);
    const [isEditPetCardInfo, setIsEditPetCardInfo] = useState(false);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [birthday, setBirthday] = useState('');

    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    const [isSelectingPet, setIsSelectingPet] = useState(false);
    const [petId, setPetId] = useState('');
    const [pets, setPets] = useState([]);

    useEffect(() => {
        fetch('/api/user/pets', {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('token')
            }
        })
            .then(res => res.json())
            .then(data => {
                    setPets(data);
                }
            )
    }, []);

    useEffect(() => {
        fetch(`/api/user/me`, {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('token')
            }
        })
            .then(res => res.json())
            .then(data => {
                    setFirstName(data.firstName);
                    setLastName(data.lastName);
                    setBirthday(data.birthday);
                    setEmail(data.email);
                    setPhone(data.phone);
                }
            )
    }, []);

    const handleEditUserInfo = () => {
        setIsEditUserInfo(false);
    }
    const handleEditAccountInfo = () => {
        setIsEditAccountInfo(false);
    }
    const handleEditPetCardInfo = () => {
        setIsEditPetCardInfo(false);
    }
    const handleSelectingPet = () => {
        setIsSelectingPet(false);
    }
    const handlePetId = (id) => {
        setPetId(id);
    }
    const handlePets = (pets) => {
        setPets(pets);
    }


    return (
        <div className={`side-bar ${isOpen ? 'side-bar-open' : ''} ${className}`}>
            <ImageButton className={"side-bar__image-button"}
                         source={"/assets/images/closing-cross-flatten-small.png"}
                         onClick={onCLick}></ImageButton>
            <div className="side-bar__user">
                <p>{firstName} {lastName}</p>
                {
                    className !== "admin" && pets.length > 0 && pets.map(pet => (
                        <ul className={"side-bar__list"}>
                            <li className={"side-bar__list-item"}
                                key={pet.id}>
                                {pet.name}
                            </li>
                        </ul>
                    ))
                }
                            </div>
            {
                !isEditUserInfo && !isEditAccountInfo && !isEditPetCardInfo && className !== 'admin' && (
                    <>
                        <Button className="side-bar__button" content="Редагувати дані для входу"
                                onClick={() => setIsEditAccountInfo(true)}/>
                        <Button className="side-bar__button" content="Редагувати дані користувача"
                                onClick={() => setIsEditUserInfo(true)}/>
                        <Button className="side-bar__button" content="Редагувати картку пацієнта"
                                onClick={() => setIsEditPetCardInfo(true)}/>
                        <Button className="side-bar__button exit-button" onClick={() => {
                            localStorage.removeItem('token');
                            navigate('/signin');
                        }}
                                content="Вихід"/>
                    </>
                )
            }
            {
                !isEditUserInfo && !isEditAccountInfo && !isEditPetCardInfo && className === 'admin' && (
                    <>
                        <Button className="side-bar__button" content="Редагувати дані для входу"
                                onClick={() => setIsEditAccountInfo(true)}/>
                        <Button className="side-bar__button" content="Редагувати дані користувача"
                                onClick={() => setIsEditUserInfo(true)}/>
                        <Button className="side-bar__button exit-button" onClick={() => {
                            localStorage.removeItem('token');
                            navigate('/signin');
                        }}
                                content="Вихід"/>
                    </>
                )
            }
            {
                isEditUserInfo && (
                    <>
                        <EditUserInfo handleEditUserInfo={handleEditUserInfo}
                                      firstName={firstName} lastName={lastName} birthday={birthday}
                                      onChangeFirst={e => setFirstName(e.target.value)}
                                      onChangeLast={e => setLastName(e.target.value)}
                                      onChangeBirthday={e => setBirthday(e.target.value)}></EditUserInfo>
                    </>
                )
            }
            {
                isEditAccountInfo && (
                    <>
                        <EditAccountInfo handleEditAccountInfo={handleEditAccountInfo}
                                         email={email} phone={phone}
                                         onChangeEmail={e => setEmail(e.target.value)}
                                         onChangePhone={e => setPhone(e.target.value)}
                                         isAdmin={className === "admin"}></EditAccountInfo>
                    </>
                )
            }
            {
                isEditPetCardInfo && (
                    <>
                        <EditPetCardInfo handleEditPetCardInfo={handleEditPetCardInfo}
                                         handlePetId={handlePetId}
                                         handleIsSelectingPet={handleSelectingPet}
                                         isSelectingPet={isSelectingPet}
                                         pets={pets}
                                         handlePets={handlePets}></EditPetCardInfo>
                    </>
                )
            }


        </div>
    );
}
