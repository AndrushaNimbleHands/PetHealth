import React from 'react';
import '../assets/styles/main.scss';
import Button from "./Button";

export default function Pagination({page, setPage, totalPages}) {
    return (
        <div className="pagination">
            <Button className={`pagination__button ${page === 1 || totalPages === 0 ? `disabled` : ''}`}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    content={"←"}
                    disabled={page === 1 || totalPages === 0 }>←</Button>
            <span>Сторінка {page} з {totalPages}</span>
            <Button className={`pagination__button ${page === totalPages || totalPages === 0 ? 'disabled' : ''}`} onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    content={"→"}></Button>
        </div>
    );
}
