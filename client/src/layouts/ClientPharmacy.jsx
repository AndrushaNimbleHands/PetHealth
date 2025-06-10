import React, {useEffect, useState} from 'react';
import Filters from '../components/Filters';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import Cart from '../components/Cart';
import Order from "../components/Order";
import '../assets/styles/main.scss';

export default function ClientPharmacy() {
    const [products, setProducts] = useState([]);
    const [filters, setFilters] = useState({});
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedProduct, setSelectedProduct] = useState(null);


    useEffect(() => {
        const query = new URLSearchParams({...filters, page}).toString();
        fetch(`/api/shop/products?${query}`)
            .then(res => res.json())
            .then(data => {
                setProducts(data.products);
                setTotalPages(data.totalPages);
            });
    }, [filters, page]);

    return (<div className="client-pharmacy__container">
            <div className="client-pharmacy__cards-container">
                <h1>Вет-аптека</h1>
                <Filters setFilters={setFilters}/>
                <div className="client-pharmacy__products-list">
                    {Array.isArray(products) && <div className="client-pharmacy__product-item">
                        {selectedProduct ? (<ProductCard
                                product={selectedProduct}
                                isDetailed={true}
                                onClose={() => setSelectedProduct(null)}
                            />) : (products.map(p => (<ProductCard
                                    key={p._id}
                                    product={p}
                                    onOpenDetails={() => setSelectedProduct(p)}
                                />)))}
                    </div>}
                </div>
                <Pagination page={page} setPage={setPage} totalPages={totalPages}/>
            </div>
            <div className="client-pharmacy__cart-container">
                <Cart/>
            </div>
        </div>);
}
