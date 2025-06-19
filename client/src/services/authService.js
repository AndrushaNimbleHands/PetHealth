const API = process.env.REACT_APP_API_URL + '/auth';

export const sendCode = async (email) => {
    const res = await fetch(`${API}/send-code`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email })
    });

    const data = await res.json(); // ✅
    if (!res.ok) {
        throw new Error(data.error);
    }
    return data;
};

export const sendCodeSignIn = async (email) => {
    const res = await fetch(`${API}/send-code-signin`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email })
    });

    const data = await res.json(); // ✅
    if (!res.ok) {
        throw new Error(data.error);
    }
    return data;
};

export const signUp = async (email, phone, code) => {
    const res = await fetch(`${API}/signup`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email, phone, code })
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error);
    }
    return data;
};

export const signIn = async (email, code) => {
    const res = await fetch(`${API}/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error);
    }
    return data;
};
