
import { useEffect, useState } from "react";

import type { RegisteredUser } from "../api/userApi";
import {
    getOrdersByUser
} from "../api/checkOutApi";
import type {
    UserOrder
} from "../api/checkOutApi";

import "../styles/orderModal.css";

interface OrderModalProps {
    user: RegisteredUser;
    onClose: () => void;
}

export default function OrderModal({
    user,
    onClose
}: OrderModalProps) {

    const [orders, setOrders] = useState<UserOrder[]>([]);
    const [selectedOrder, setSelectedOrder] =
        useState<UserOrder | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const loadOrders = async () => {
            setLoading(true);
            setError("");
            setSelectedOrder(null);

            try {
                const data = await getOrdersByUser(user.id);

                if (!cancelled) {
                    setOrders(data);
                }
            } catch (err) {
                console.error(err);

                if (!cancelled) {
                    err instanceof Error
                        ? err.message
                        : "Failed to load orders."
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void loadOrders();

        return () => {
            cancelled = true;
        };
    }, [user.id]);

    // Close modal with Escape
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [onClose]);

    return (
        <div
            className="order-modal-overlay admin-order-modal"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                className="order-modal"
                role="dialog"
                aria-modal="true"
                aria-label={`${user.userName}'s orders`}
            >
                <div className="order-modal-header">
                    <h2>
                        {selectedOrder
                            ? `Order #${selectedOrder.id}`
                            : `${user.userName}'s Orders`}
                    </h2>

                    <button
                        type="button"
                        className="order-modal-close"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                <div className="order-modal-body">
                    {loading ? (
                        <p>Loading orders...</p>
                    ) : error ? (
                        <p className="order-modal-error">
                            {error}
                        </p>
                    ) : selectedOrder ? (
                        // ORDER DETAILS
                        <div>
                            <p>
                                Date:{" "}
                                {new Date(
                                    selectedOrder.createdAt
                                ).toLocaleString()}
                            </p>

                            <p>
                                Status: {selectedOrder.status}
                            </p>

                            <table className="order-modal-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Unit Price</th>
                                        <th>Count</th>
                                        <th>Subtotal</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {selectedOrder.items.map(item => (
                                        <tr key={item.productId}>
                                            <td>{item.productName}</td>
                                            <td>
                                                {item.unitPrice.toFixed(2)}
                                            </td>
                                            <td>{item.quantity}</td>
                                            <td>
                                                {item.totalPrice.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <h3 className="order-modal-total">
                                Total:{" "}
                                {selectedOrder.totalAmount.toFixed(2)}
                            </h3>

                            <button
                                type="button"
                                className="order-modal-back"
                                onClick={() => setSelectedOrder(null)}
                            >
                                ← Back to Orders
                            </button>
                        </div>
                    ) : orders.length === 0 ? (
                        <p>This user has no orders yet.</p>
                    ) : (
                        // ORDER LIST
                        <div className="order-modal-list">
                            {orders.map(order => (
                                <button
                                    key={order.id}
                                    type="button"
                                    className="order-modal-order"
                                    onClick={() => setSelectedOrder(order)}
                                >
                                    <div>
                                        <strong>
                                            Order #{order.id}
                                        </strong>

                                        <span>
                                            {new Date(
                                                order.createdAt
                                            ).toLocaleString()}
                                        </span>
                                    </div>

                                    <div>
                                        <span>{order.status}</span>

                                        <strong>
                                            {order.totalAmount.toFixed(2)}
                                        </strong>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
