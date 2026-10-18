
import "../styles/productMenu.css";
import type { CartItem } from "../types/types";

interface ShoppingListProps {
    cart: CartItem[];
    onRemove: (productId: number) => void;
    onPay: () => void;
    paying: boolean;

}

export default function ShoppingList({
    cart,
    onRemove, onPay, paying
}: ShoppingListProps) {

    // Calculate total price
    const totalPrice = cart.reduce(
        (total, item) =>
            total + item.unitPrice * item.quantity,
        0
    );

    return (
        <div className="product-menu-container shopping-list-container">
            <div className="product-menu shopping-list">

                <div className="product-menu-header">
                    <h1>Shopping List</h1>
                </div>

                <div className="product-table-wrapper">
                    <table className="product-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Product Name</th>
                                <th>Unit Price</th>
                                <th>Count</th>
                                <th>Total Price</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {cart.length === 0 ? (
                                <tr>
                                    <td colSpan={6}>
                                        Your shopping cart is empty.
                                    </td>
                                </tr>
                            ) : (
                                cart.map((item) => (
                                    <tr key={item.productId}>
                                        <td>{item.productId}</td>

                                        <td>{item.productName}</td>

                                        <td>
                                            {item.unitPrice.toFixed(2)}
                                        </td>

                                        <td>{item.quantity}</td>

                                        <td>
                                            {(
                                                item.unitPrice *
                                                item.quantity
                                            ).toFixed(2)}
                                        </td>

                                        <td>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onRemove(item.productId)
                                                }
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="shopping-list-footer">
                    <div className="shopping-total">
                        <span>Total Price:</span>
                        <strong>
                            {totalPrice.toFixed(2)}
                        </strong>
                    </div>

                    <button
                        type="button"
                        className="shopping-pay-btn"
                        onClick={onPay}
                        disabled={cart.length === 0 || paying}
                    >
                        Pay
                    </button>
                </div>

            </div>
        </div>
    );
}
