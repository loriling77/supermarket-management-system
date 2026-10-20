
import "../styles/productMenu.css";

import { useEffect, useState } from "react";
import type { Product, CartItem } from "../types/types";

interface UserOrderMenuProps {
    search: string;
    onSelect: (product: Product) => void;
    cart: CartItem[];
}

export default function UserOrderMenu({
    search,
    onSelect, cart
}: UserOrderMenuProps) {

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Load products from ASP.NET Core API
    useEffect(() => {
        const loadProducts = async () => {
            try {
                const response = await fetch(
                    "/api/product",
                    {
                        credentials: "include"
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to load products.");
                }

                const data: Product[] = await response.json();

                setProducts(data);

            } catch (err) {
                console.error(err);
                setError("Unable to load products.");
            } finally {
                setLoading(false);
            }
        };

        void loadProducts();
    }, []);

    // Search products (case-insensitive)
    const filteredProducts = products.filter(product =>
        product.productName
            .toLowerCase()
            .includes(search.trim().toLowerCase())
    );

    return (
        <div className="product-menu-container">
            <div className="product-menu">
                <div className="product-menu-header">
                    <h1>Product List</h1>
                </div>

                <div className="product-table-wrapper">
                    <table className="product-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Product Name</th>
                                <th>Total Stock</th>
                                <th>Unit Price</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5}>
                                        Loading products...
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={5}>
                                        {error}
                                    </td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={5}>
                                        No products found.
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map(product => (
                                    <tr key={product.id}>
                                        <td>{product.id}</td>
                                        <td>{product.productName}</td>
                                        <td>
                                            {product.count - (
                                                cart.find(item => item.productId === product.id)
                                                    ?.quantity ?? 0
                                            )}
                                        </td>
                                        <td>{product.price}</td>
                                        <td>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onSelect(product)
                                                }
                                            >
                                                Select
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
