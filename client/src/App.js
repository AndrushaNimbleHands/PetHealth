import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import MainPage from './pages/MainPage';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ErrorPage from './pages/ErrorPage';
import AdminMainPage from './pages/AdminMainPage';
import RequireAuth from './components/RequireAuth';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route
                    path="/"
                    element={
                        <RequireAuth roleRequired="client">
                            <MainPage />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/admin"
                    element={
                        <RequireAuth roleRequired={['admin', 'doctor']}>
                            <AdminMainPage />
                        </RequireAuth>
                    }
                />
                <Route path="/error" element={<ErrorPage />} />
                <Route path="*" element={<Navigate to="/error" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
