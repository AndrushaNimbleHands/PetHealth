export const addProcedure = async (procedureData) => {
    const res = await fetch('/api/procedures', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify(procedureData)
    });

    if (!res.ok) throw new Error('Не вдалося додати процедуру');
    return res.json();
};

