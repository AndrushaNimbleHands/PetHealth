import React from 'react';
import logo from './logo.svg';
import './App.css';
import MainPage from './pages/MainPage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import SignIn from './pages/SignIn';
import SignUp from "./pages/SignUp";
function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                {/* Маршрут 404 на випадок неправильного шляху */}
                <Route path="*" element={<MainPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
