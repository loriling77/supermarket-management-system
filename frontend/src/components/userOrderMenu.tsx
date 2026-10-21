import "../styles/productMenu.css";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { getProducts } from "../api/productApi";
import type { Product, CartItem } from "../types/types";

interface UserOrderMenuProps {
    search: string;
    onAddToCart: (product: Product, quantity: number) => boolean;
    cart: CartItem[];
    disabled?: boolean;
}

export default function UserOrderMenu({
    search, onAddToCart, cart, disabled = false
}: UserOrderMenuProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [quantities, setQuantities] = useState<Record<number, string>>({});
    const [rowErrors, setRowErrors] = useState<Record<number, string>>({});

    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                const data = await getProducts();
                if (active) {
                    setProducts(data);
                    setQuantities({});
                    setRowErrors({});
                }
            } catch {
                if (active) setError("Unable to load products.");
            } finally {
                if (active) setLoading(false);
            }
        };
        void load();
        return () => { active = false; };
    }, []);

    const filteredProducts = products.filter(product =>
        product.productName.toLowerCase().includes(search.trim().toLowerCase())
    );

    const addToCart = (product: Product, availableStock: number) => {
        const quantity = Number(quantities[product.id] ?? "1");
        let message = "";
        if (!Number.isSafeInteger(quantity) || quantity <= 0) {
            message = "Enter a positive whole number.";
        } else if (quantity > availableStock) {
            message = `Only ${availableStock} available to add.`;
        } else if (!onAddToCart(product, quantity)) {
            message = "Unable to add this quantity. Check the available stock.";
        }
        setRowErrors(previous => ({ ...previous, [product.id]: message }));
        if (!message) {
            setQuantities(previous => ({ ...previous, [product.id]: "1" }));
        }
    };

    return (
        <div className="product-menu-container">
            <div className="product-menu">
                <div className="product-menu-header"><h2>Fresh picks</h2><p>{loading ? "Finding your favourites…" : `${filteredProducts.length} products to explore`}</p></div>
                <div className="product-table-wrapper">
                    <table className="product-table">
                        <thead><tr>
                            <th>Product</th><th>Stock</th>
                            <th>Unit Price</th><th>Quantity</th><th>Action</th>
                        </tr></thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5}>Loading products...</td></tr>
                            ) : error ? (
                                <tr><td colSpan={5} role="alert">{error}</td></tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr><td colSpan={5}>No products found.</td></tr>
                            ) : filteredProducts.map(product => {
                                const reserved = cart.find(item => item.productId === product.id)?.quantity ?? 0;
                                const available = Math.max(0, product.count - reserved);
                                const unavailable = disabled || available === 0;
                                const errorId = `quantity-error-${product.id}`;
                                return (
                                    <tr key={product.id}>
                                        <td><span className="user-order-product-name">{product.productName}</span></td>
                                        <td><span className={`user-order-stock${available === 0 ? " is-empty" : ""}`}>
                                            {available === 0 ? "Sold out" : `${available} available`}
                                        </span></td>
                                        <td className="user-order-price">£{product.price.toFixed(2)}</td>
                                        <td className="user-order-quantity-cell">
                                            <input
                                                className="user-order-quantity"
                                                type="number" min={1} max={available} step={1}
                                                aria-label={`Quantity for ${product.productName}`}
                                                aria-invalid={Boolean(rowErrors[product.id])}
                                                aria-describedby={rowErrors[product.id] ? errorId : undefined}
                                                value={quantities[product.id] ?? "1"}
                                                disabled={unavailable}
                                                onChange={event => {
                                                    setQuantities(previous => ({ ...previous, [product.id]: event.target.value }));
                                                    setRowErrors(previous => ({ ...previous, [product.id]: "" }));
                                                }}
                                            />
                                            {rowErrors[product.id] && (
                                                <small id={errorId} className="user-order-quantity-error" role="alert">
                                                    {rowErrors[product.id]}
                                                </small>
                                            )}
                                        </td>
                                        <td>
                                            <button type="button" className="user-order-add-button"
                                                aria-label={`Add ${product.productName} to cart`}
                                                disabled={unavailable}
                                                onClick={() => addToCart(product, available)}>
                                                <Plus size={15} aria-hidden="true" />{available === 0 ? "Sold out" : "Add to cart"}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
