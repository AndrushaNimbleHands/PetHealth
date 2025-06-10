import React, {useState} from 'react';
import '../assets/styles/main.scss';
import Header from "../layouts/Header";
import Button from "../components/Button";
import LeftMenu from "../layouts/LeftMenu";
import AdminLeftMenu from "../layouts/AdminLeftMenu";
import Procedure from "../layouts/Procedure";
import Users from "../layouts/Users";
import PetCardsAdmin from "../layouts/PetCardsAdmin";
import Schedule from "../layouts/Schedule";
import PharmacyAdmin from "../layouts/PharmacyAdmin";
import AdminAppointment from "../layouts/AdminAppointment";
import AdminOrders from "../layouts/AdminOrders";


export default function AdminMainPage() {
    const [isAppointments, setIsAppointments] = useState(false);
    const [isOrders, setIsOrders] = useState(false);
    const [isPetCards, setIsPetCards] = useState(false);
    const [isVetPharmacy, setIsVetPharmacy] = useState(false);
    const [isSchedule, setIsSchedule] = useState(false);
    const [isProcedures, setIsProcedures] = useState(false);
    const [isUsers, setIsUsers] = useState(false);
    const appointmentOnClick = () => {
        setIsAppointments(true);
        setIsPetCards(false);
        setIsVetPharmacy(false);
        setIsSchedule(false);
        setIsProcedures(false);
        setIsUsers(false);
        setIsOrders(false);
    }
    const petCardOnClick = () => {
        setIsPetCards(true);
        setIsAppointments(false);
        setIsVetPharmacy(false);
        setIsSchedule(false);
        setIsProcedures(false);
        setIsUsers(false);
        setIsOrders(false);
    }
    const vetPharmacyOnClick = () => {
        setIsVetPharmacy(true);
        setIsAppointments(false);
        setIsPetCards(false);
        setIsSchedule(false);
        setIsProcedures(false);
        setIsUsers(false);
        setIsOrders(false);
    }
    const scheduleOnClick = () => {
        setIsSchedule(true);
        setIsAppointments(false);
        setIsPetCards(false);
        setIsVetPharmacy(false);
        setIsProcedures(false);
        setIsUsers(false);
        setIsOrders(false);
    }
    const proceduresOnClick = () => {
        setIsProcedures(true);
        setIsAppointments(false);
        setIsPetCards(false);
        setIsVetPharmacy(false);
        setIsSchedule(false);
        setIsUsers(false);
        setIsOrders(false);
    }
    const usersOnClick = () => {
        setIsUsers(true);
        setIsAppointments(false);
        setIsPetCards(false);
        setIsVetPharmacy(false);
        setIsSchedule(false);
        setIsProcedures(false);
        setIsOrders(false);
    }
    const ordersOnClick = () => {
        setIsOrders(true);
        setIsUsers(false);
        setIsAppointments(false);
        setIsPetCards(false);
        setIsVetPharmacy(false);
        setIsSchedule(false);
        setIsProcedures(false);
    }

    return (
        <div className="main-page__container admin-main-page__container">
            <Header className={"admin"}/>
            <div className={"main-content__container"}>
                <AdminLeftMenu appointmentOnClick={appointmentOnClick}
                               petCardOnClick={petCardOnClick}
                               vetPharmacyOnClick={vetPharmacyOnClick}
                               scheduleOnClick={scheduleOnClick}
                               proceduresOnClick={proceduresOnClick}
                               usersOnClick={usersOnClick}
                               ordersOnClick={ordersOnClick}></AdminLeftMenu>
                {
                    isProcedures && (
                        <>
                            <Procedure></Procedure>
                        </>
                    )
                }
                {
                    isUsers && (
                        <>
                            <Users></Users>
                        </>
                    )
                }
                {
                    isPetCards && (
                        <>
                        <PetCardsAdmin></PetCardsAdmin>
                        </>
                    )
                }
                {
                    isSchedule && (
                        <Schedule></Schedule>
                    )
                }
                {
                    isVetPharmacy && (
                        <PharmacyAdmin></PharmacyAdmin>
                    )
                }
                {
                    isAppointments && (
                     <AdminAppointment></AdminAppointment>
                    )
                }
                {
                    isOrders && (
                        <AdminOrders></AdminOrders>
                    )
                }
            </div>
            <div></div>
        </div>

    );
}
