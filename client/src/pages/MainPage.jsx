import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/main.scss';
import Header from "../layouts/Header";
import Button from "../components/Button";
import LeftMenu from "../layouts/LeftMenu";
import PetCardClient from "../layouts/PetCardClient";
import Appointment from "../layouts/Appointment";
import ClientPharmacy from "../layouts/ClientPharmacy";
import { CartProvider } from "../context/CartContext";
import Order from "../components/Order";

export default function MainPage() {
    const [isCreateAppointment, setIsCreateAppointment] = useState(false);
    const [isPetCard, setIsPetCard] = useState(false);
    const [isPharmacy, setIsPharmacy] = useState(false);
    const [isOrders, setIsOrders] = useState(false);

    const appointmentOnClick = () => {
        setIsCreateAppointment(true);
        setIsPetCard(false);
        setIsPharmacy(false);
        setIsOrders(false);
    };
    const petCardOnClick = () => {
        setIsCreateAppointment(false);
        setIsPetCard(true);
        setIsPharmacy(false);
        setIsOrders(false);
    };
    const pharmacyOnClick = () => {
        setIsCreateAppointment(false);
        setIsPetCard(false);
        setIsPharmacy(true);
        setIsOrders(false);
    };
    const ordersOnClick = () => {
        setIsOrders(true);
        setIsCreateAppointment(false);
        setIsPetCard(false);
        setIsPharmacy(false);
    };

    return (
        <div className="main-page__container">
            <Header />
            <div className="main-content__container">
                <LeftMenu
                    appointmentOnClick={appointmentOnClick}
                    petCardOnClick={petCardOnClick}
                    pharmacyOnClick={pharmacyOnClick}
                    ordersOnClick={ordersOnClick}
                />
                {isCreateAppointment && <Appointment />}
                {isPetCard && <PetCardClient />}
                {isPharmacy && (
                    <CartProvider>
                        <ClientPharmacy />
                    </CartProvider>
                )}
                {isOrders && <Order />}
            </div>
        </div>
    );
}
