import React, {useEffect, useState} from 'react';
import Button from '../components/Button';


const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const readable = {
    monday: "Пн", tuesday: "Вт", wednesday: "Ср", thursday: "Чт",
    friday: "Пт", saturday: "Сб", sunday: "Нд"
};

const defaultSchedule = daysOfWeek.map(day => ({
    day,
    isOpen: day !== "monday",
    workStart: "09:00",
    workEnd: "17:00",
    hasLunchBreak: false,
    lunchStart: "",
    lunchEnd: "",
    isSurgeryDay: false,
    surgeryStart: "",
    surgeryEnd: ""
}));

export default function Schedule() {
    const [schedule, setSchedule] = useState([]);
    const [conflictAppointments, setConflictAppointments] = useState([]);
    const [showConflictList, setShowConflictList] = useState(false);


    useEffect(() => {
        fetch('/api/schedule', {
            headers: {Authorization: 'Bearer ' + localStorage.getItem('token')}
        })
            .then(res => res.json())
            .then(data => {
                if (data?.weekSchedule?.length) {
                    setSchedule(data.weekSchedule);
                } else {
                    setSchedule(defaultSchedule);
                }
            });
    }, []);


    const handleChange = (i, field, value) => {
        const updated = [...schedule];
        updated[i][field] = value;
        setSchedule(updated);
    };

    const handleSave = async () => {
        await fetch('/api/schedule', {
            method: 'PUT',
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('token'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({weekSchedule: schedule})
        });
        await fetch('/api/schedule/appointments/notify-in-closed-days', {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('token')
            }
        });
        const conflictRes = await fetch('/api/schedule/appointments/notify-in-closed-days', {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('token')
            }
        });
        const conflictData = await conflictRes.json();
        setConflictAppointments(conflictData);
        setShowConflictList(true);

        alert("Графік збережено");
    };

    return (
        <div className="schedule">
            <h1>Графік роботи клініки</h1>
            <div className="schedule-container">
                <table cellSpacing={0}>
                    <thead>
                    <tr>
                        <th>День</th>
                        <th>Працює</th>
                        <th>Години</th>
                        <th>Обід</th>
                        <th>Операційний день</th>
                    </tr>
                    </thead>
                    <tbody>
                    {schedule.map((day, i) => (
                        <tr key={day.day}>
                            <td>{readable[day.day]}</td>
                            <td>
                                <input className={"schedule__input-checkbox"}
                                       type="checkbox"
                                       checked={day.isOpen}
                                       onChange={e => handleChange(i, 'isOpen', e.target.checked)}/>
                            </td>
                            <td>
                                {day.isOpen && (
                                    <>
                                        <input type="time" value={day.workStart}
                                               onChange={e => handleChange(i, 'workStart', e.target.value)}/>
                                        -
                                        <input type="time" value={day.workEnd}
                                               onChange={e => handleChange(i, 'workEnd', e.target.value)}/>
                                    </>
                                )}
                            </td>
                            <td>
                                <input className={"schedule__input-checkbox"} type="checkbox"
                                       checked={day.hasLunchBreak}
                                       onChange={e => handleChange(i, 'hasLunchBreak', e.target.checked)}/>
                                {day.hasLunchBreak && (
                                    <>
                                        <br/>
                                        <input type="time" value={day.lunchStart}
                                               onChange={e => handleChange(i, 'lunchStart', e.target.value)}/>
                                        <br/>
                                        <input type="time" value={day.lunchEnd}
                                               onChange={e => handleChange(i, 'lunchEnd', e.target.value)}/>
                                    </>
                                )}
                            </td>
                            <td>
                                <input className={"schedule__input-checkbox"} type="checkbox"
                                       checked={day.isSurgeryDay}
                                       onChange={e => handleChange(i, 'isSurgeryDay', e.target.checked)}/>
                                {day.isSurgeryDay && (
                                    <>
                                        <br/>
                                        <input type="time" value={day.surgeryStart}
                                               onChange={e => handleChange(i, 'surgeryStart', e.target.value)}/>
                                        <br/>
                                        <input type="time" value={day.surgeryEnd}
                                               onChange={e => handleChange(i, 'surgeryEnd', e.target.value)}/>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                <Button onClick={handleSave} content="Зберегти графік"
                        className={"schedule__button schedule__save-button"}/>
            </div>
            <div className={"schedule__conflicts-container"}>
                {showConflictList && (
                    <div className="schedule__conflict-list">
                        {conflictAppointments.length === 0
                            ? <p>Немає записів у закриті дні.</p>
                            : (
                                <>
                                    <h3>Скасовані записи на закриті дні:</h3>
                                    {conflictAppointments.map(a => (
                                        <div key={a._id} className="schedule__conflict-item">
                                            <p>
                                                <strong>{a.date}</strong> • {a.startTime}–{a.endTime} • {a.procedureId?.name}
                                            </p>
                                        </div>
                                    ))}
                                </>
                            )}

                    </div>
                )}

            </div>
        </div>
    );
}
