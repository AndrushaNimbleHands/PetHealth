import React, {useEffect, useState} from 'react';
import '../assets/styles/main.scss';
import Button from "../components/Button";
import Field from "../components/Field";
import Selector from "./Selector";


export default function     ProcedureItem({onSubmit, initial, handleBack}) {
    const [name, setName] = useState('');
    const [speciesList, setSpeciesList] = useState([]);
    const [selectedSpecies, setSelectedSpecies] = useState('');
    const [doctorList, setDoctorList] = useState([]);
    const [doctor, setDoctor] = useState('');
    const [price, setPrice] = useState(0);
    const [selfBooking, setSelfBooking] = useState(false);
    const [duration, setDuration] = useState(0);

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetch('/api/species', {
            headers: {Authorization: `Bearer ${token}`}
        })
            .then(res => res.ok ? res.json() : [])
            .then(data => setSpeciesList([{_id: 'universal', name: 'Універсальна'}, ...data]));

        fetch('/api/procedures/doctors', {
            headers: {Authorization: `Bearer ${token}`}
        })
            .then(res => res.ok ? res.json() : [])
            .then(setDoctorList);

        if (initial) {
            setName(initial.name);
            setSelectedSpecies(initial.species?.[0]?._id || 'universal');
            setDoctor(initial.doctor?._id || '');
            setPrice(initial.price);
            setSelfBooking(initial.selfBooking);
            setDuration(initial.duration);
        } else {
            setName('');
            setSelectedSpecies('');
            setDoctor('');
            setPrice(0);
            setSelfBooking(false);
            setDuration(30);
        }
    }, [initial, token]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            _id: initial?._id,
            name,
            species: selectedSpecies === 'universal' ? [] : [selectedSpecies],
            doctor,
            price,
            selfBooking,
            duration
        });
    };

    return (
        <div className="procedure-item-container">
            <form>
                <Field className={"procedure-item__name"} classNameTitle={"procedure-item__name-title"}
                       title={"Назва процедури:"} type="text" value={name} onChange={e => setName(e.target.value)}
                       placeholder="Назва" required/>

                <Selector
                    className={"procedure-item__species"}
                    label={`Вид тварини:`}
                    value={selectedSpecies}
                    onChange={e => setSelectedSpecies(e.target.value)}
                    option="Оберіть вид"
                    speciesList={speciesList}
                />
                <div className={`procedure-item__doctor`}>
                    <label>Оберіть лікаря: </label>
                    <select value={doctor} onChange={e => setDoctor(e.target.value)}>
                        <option value="" disabled={true}>Оберіть лікаря</option>
                        {doctorList.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                    </select>
                </div>
                <div className={`procedure-item__price`}>
                    <label>
                        Введіть вартість процедури (грн.):
                    </label>
                    <input type="number" value={price}
                           onChange={e => setPrice(+e.target.value)} placeholder="Вартість"
                           required/>
                </div>
                <div className={`procedure-item__duration`}>
                    <label>
                        Введіть тривалість процедури (хв):
                    </label>
                    <input type="number" value={duration} onChange={e => setDuration(+e.target.value)}
                           placeholder="Тривалість (хв)" required/>
                </div>
                <div className={`procedure-item__self-booking`}>
                    <label>
                        Самозапис дозволено
                    </label>
                    <input type="checkbox" checked={selfBooking} onChange={e => setSelfBooking(e.target.checked)}/>
                </div>
                <div className={`procedure-item__down-buttons-container`}>
                    <Button content={"Зберегти"} className={"procedure-item__button procedure-item__save-button"}
                            onClick={handleSubmit}></Button>
                    {
                        initial &&
                        <Button content={"Назад"} className={"procedure-item__button procedure-item__back-button"}
                                onClick={handleBack}></Button>
                    }
                </div>
            </form>
        </div>
    );
}
