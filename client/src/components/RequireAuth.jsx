import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function RequireAuth({ children, roleRequired }) {
    const [checked, setChecked] = useState(false);
    const [authorized, setAuthorized] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const invalidToken = !token || token === 'null' || token === 'undefined' || token.trim() === '';
        const invalidRole = !role || role === 'null' || role === 'undefined' || role.trim() === '';

        if (!invalidToken && !invalidRole && (!roleRequired || role === roleRequired)) {
            setAuthorized(true);
        }

        setChecked(true);
    }, [roleRequired]);

    if (!checked) return null;
    if (!authorized) return <Navigate to="/signin" replace state={{ from: location }} />;
    return children;
}
