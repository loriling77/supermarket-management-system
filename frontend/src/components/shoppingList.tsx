import "../styles/productMenu.css";
import { ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import type { CartItem } from "../types/types";

interface ShoppingListProps {
    cart: CartItem[];
    onRemove: (productId: number) => void;
    onPay: () => void;
    paying: boolean;
}

export default function ShoppingList({cart, onRemove, onPay, paying}: ShoppingListProps) {
    const totalPrice = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <section className="product-menu-container shopping-list-container" aria-labelledby="shopping-cart-title">
            <div className="product-menu shopping-list">
                <div className="product-menu-header user-order-cart-header">
                    <div>
                        <h2 id="shopping-cart-title">Your cart</h2>
                        <p>Review your items before checkout.</p>
                    </div>
                    <span className="user-order-cart-badge">{itemCount}</span>
                </div>
                {cart.length === 0 ? (
                    <div className="user-order-empty-cart">
                        <span><ShoppingBag size={30} strokeWidth={1.5} aria-hidden="true" /></span>
                        <strong>Your cart is empty</strong>
                        <p>Add products from the catalogue.</p>
                    </div>
                ) : (
                    <ul className="user-order-cart-items" aria-label="Cart items">
                        {cart.map(item => (
                            <li key={item.productId}>
                                <div className="user-order-cart-item-info">
                                    <strong>{item.productName}</strong>
                                    <span>{item.quantity} × £{item.unitPrice.toFixed(2)}</span>
                                </div>
                                <strong className="user-order-cart-line-total">£{(item.unitPrice * item.quantity).toFixed(2)}</strong>
                                <button type="button" className="user-order-remove"
                                    aria-label={`Remove ${item.productName} from cart`}
                                    onClick={() => onRemove(item.productId)} disabled={paying}>
                                    <Trash2 size={16} aria-hidden="true" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
                <div className="shopping-list-footer">
                    <div className="user-order-cart-summary"><span>Items</span><span>{itemCount}</span></div>
                    <div className="shopping-total"><span>Total</span><strong>£{totalPrice.toFixed(2)}</strong></div>
                    <button type="button" className="shopping-pay-btn" onClick={onPay}
                        disabled={cart.length === 0 || paying}>
                        <span>{paying ? "Processing…" : "Checkout"}</span>
                        <ArrowRight size={17} aria-hidden="true" />
                    </button>
                </div>
            </div>
        </section>
    );
}
