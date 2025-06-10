import React, {useEffect, useState} from 'react';
import '../assets/styles/main.scss';
import Button from "../components/Button";
import Field from "../components/Field";
import Selector from "../components/Selector";


export default function EditPetCardInfo({
                                            handleIsSelectingPet,
                                            handleEditPetCardInfo,
                                            isSelectingPet,
                                            pets,
                                            handlePets,
                                        }) {
    const [isEdit, setIsEdit] = useState(false);
    const [isNew, setIsNew] = useState(false);
    const [speciesList, setSpeciesList] = useState([]);
    const [selectedSpecies, setSelectedSpecies] = useState("");
    const [breed, setBreed] = useState('');
    const [birthday, setBirthday] = useState('');
    const [petName, setPetName] = useState('');
    const [petId, setPetId] = useState('');
    const fetchPets = () => {
        fetch("/api/user/pets", {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('token')
            }
        })
            .then(res => res.json())
            .then(data => handlePets(data)); // оновлює батьківський state
    };
    useEffect(() => {
        console.log('selectedSpecies changed to:', selectedSpecies);
    }, [selectedSpecies]);
    useEffect(() => {

        fetch("/api/species", {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('token')
            }
        })
            .then(res => res.json())
            .then(setSpeciesList);

        fetchPets();
    }, []);

    const handleSave = async () => {
        await fetch('/api/user/pet-card', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({
                petId: petId,
                name: petName,
                breed: breed,
                birthday: new Date(birthday),
                speciesId: selectedSpecies
            })
        });
        fetchPets();
        handleEditPetCardInfo();
        handleIsSelectingPet();
        setIsEdit(false);
        alert("Дані картки пацієнта оновлено!")
    }
    const handleAdd = async () => {
        await fetch('/api/user/pet-card', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({
                name: petName,
                breed: breed,
                birthday: new Date(birthday),
                speciesId: selectedSpecies
            })
        });
        fetchPets();
        handleEditPetCardInfo();
        handleIsSelectingPet();
        setIsEdit(false);
        setIsNew(false);
        alert("Нову картку створено!")
    }
    const handleDelete = async () => {
        if (!window.confirm("Ви впевнені, що хочете видалити цю картку?")) return;
        try {
            await fetch('/api/pet-card/' + petId, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify({petId: petId})

            });
            handleEditPetCardInfo();
            setIsEdit(false);
            alert("Картку тварини видалено!");
            fetchPets();
        } catch (error) {
            console.error('Помилка при видаленні:', error);
            alert("Сталася помилка при видаленні картки.");
        }
    };


    const handleBack = () => {
        handleEditPetCardInfo();
    }

    return (
        <div className={"edit-pet-card-info"}>
            {
                !isSelectingPet && !isEdit && (
                    <>
                        <div className={"edit-info-title"}>
                            Оберіть картку:
                        </div>
                        <hr/>
                        {
                            pets.map(pet => (
                                <Button className={"edit-info__button edit-pet-card-info__choose-button"}
                                        key={pet._id}
                                        content={pet.name}
                                        onClick={() => {
                                            setPetId(pet._id);
                                            setPetName(pet.name);
                                            setBreed(pet.breed);
                                            setBirthday(pet.birthday);
                                            setSelectedSpecies(pet.speciesId);
                                            setIsEdit(true);
                                            handleIsSelectingPet();
                                        }}></Button>
                            ))
                        }
                        <hr/>
                        <Button className={"edit-info__button edit-pet-card-info__add-button"} content={"Додати нову картку"}
                                onClick={() => {
                                    setPetId(null);
                                    handleIsSelectingPet(false);
                                    setIsEdit(true);
                                    setIsNew(true);
                                }}></Button>
                    </>
                )
            }
            {
                isEdit && (
                    <>
                        <Field className={"edit-pet-card-info__name"} classNameTitle={"edit-info-title"} title={"Ім'я"}
                               value={petName} onChange={e => {
                            setPetName(e.target.value)
                        }} type={"text"}></Field>
                        <Selector className={"edit-pet-card-info__species-selector"}
                                  label={"Вид тварини:"}
                                  value={selectedSpecies}
                                  onChange={e => {
                                      setSelectedSpecies(e.target.value);
                                      console.log(e.target.value);
                                      console.log(selectedSpecies);
                                  }}
                                  option={"Оберіть вид"}
                                  speciesList={speciesList}></Selector>
                        <Field className={"edit-pet-card-info__breed"} classNameTitle={"edit-info-title"} title={"Порода"}
                               value={breed} onChange={e => {
                            setBreed(e.target.value)
                        }} type={"text"}></Field>
                        <Field className={"edit-pet-card-info__birthday"} classNameTitle={"edit-info-title"} title={"Дата народження"}
                               value={birthday ? new Date(birthday).toISOString().split('T')[0] : ''} onChange={e => {
                            setBirthday(e.target.value)
                        }} type={"date"} lang="uk-UA"></Field>

                        {
                            !isNew && (
                                <>
                                    <Button className={"edit-info__button edit-pet-card-info__save-button"}
                                            onClick={handleSave}
                                            content={"Зберегти"}></Button>
                                    <Button className={"edit-info__button edit-pet-card-info__delete-button"} onClick={handleDelete}
                                            content={"Видалити"}></Button>
                                </>
                            )
                        }
                        {
                            isNew && (
                                <Button className={"edit-info__button edit-pet-card-info__add-button"} onClick={handleAdd}
                                        content={"Додати"}></Button>
                            )
                        }

                    </>
                )
            }
            <Button className={"edit-info__back-button edit-info__button edit-pet-card-info__back-button"} onClick={handleBack}
                    content={"Назад"}></Button>
        </div>
    );
}

