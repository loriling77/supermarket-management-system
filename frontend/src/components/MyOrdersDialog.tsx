import { useEffect, useRef, useState } from "react";
import { ChevronDown, ReceiptText, RefreshCw, X } from "lucide-react";
import { getMySuccessfulOrders } from "../api/checkOutApi";
import type { UserOrder } from "../api/checkOutApi";
import "../styles/myOrders.css";

type OrderState =
    | { status: "loading" }
    | { status: "ready"; orders: UserOrder[] }
    | { status: "error"; message: string };

interface MyOrdersDialogProps {
    onClose: () => void;
    latestOrderId: number | null;
}

export default function MyOrdersDialog({ onClose, latestOrderId }: MyOrdersDialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [state, setState] = useState<OrderState>({ status: "loading" });
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (dialog && !dialog.open) dialog.showModal();
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        const load = async () => {
            try {
                const orders = await getMySuccessfulOrders(controller.signal);
                if (!controller.signal.aborted) setState({ status: "ready", orders });
            } catch (error) {
                if (!controller.signal.aborted) {
                    setState({ status: "error", message: error instanceof Error
                        ? error.message : "Unable to load your orders. Please try again." });
                }
            }
        };
        void load();
        return () => controller.abort();
    }, [attempt]);

    return (
        <dialog ref={dialogRef} className="my-orders-dialog" aria-labelledby="my-orders-title" onClose={onClose}>
            <header className="my-orders-header">
                <div className="my-orders-heading">
                    <span className="my-orders-icon"><ReceiptText size={22} aria-hidden="true" /></span>
                    <div><h2 id="my-orders-title">My orders</h2><p>Your successfully completed purchases.</p></div>
                </div>
                <button type="button" className="my-orders-close" aria-label="Close my orders"
                    onClick={() => dialogRef.current?.close()}><X size={20} aria-hidden="true" /></button>
            </header>
            <div className="my-orders-body" aria-busy={state.status === "loading"}>
                {state.status === "loading" ? (
                    <p className="my-orders-message" role="status">Loading your orders…</p>
                ) : state.status === "error" ? (
                    <div className="my-orders-message">
                        <p role="alert">{state.message}</p>
                        <button type="button" className="my-orders-retry" onClick={() => {
                            setState({ status: "loading" });
                            setAttempt(value => value + 1);
                        }}><RefreshCw size={15} aria-hidden="true" />Try again</button>
                    </div>
                ) : state.orders.length === 0 ? (
                    <div className="my-orders-message my-orders-empty">
                        <ReceiptText size={38} strokeWidth={1.4} aria-hidden="true" />
                        <h3>No completed orders yet</h3>
                        <p>Your orders will appear here after a successful checkout.</p>
                    </div>
                ) : (
                    <div className="my-orders-list">
                        {state.orders.map(order => (
                            <details key={order.id} className="my-orders-order" open={order.id === latestOrderId}>
                                <summary>
                                    <div className="my-orders-order-meta">
                                        <strong>Order #{order.id}</strong>
                                        <time dateTime={order.createdAt}>{new Date(order.createdAt).toLocaleString("en-GB", {
                                            dateStyle: "medium", timeStyle: "short"
                                        })}</time>
                                    </div>
                                    <span className="my-orders-paid">Paid</span>
                                    <strong className="my-orders-amount">£{order.totalAmount.toFixed(2)}</strong>
                                    <ChevronDown size={17} className="my-orders-chevron" aria-hidden="true" />
                                </summary>
                                <div className="my-orders-detail">
                                    <div className="my-orders-table-wrapper">
                                        <table>
                                            <caption className="my-orders-sr-only">Items in order #{order.id}</caption>
                                            <thead><tr><th scope="col">Product</th><th scope="col">Unit price</th>
                                                <th scope="col">Quantity</th><th scope="col">Subtotal</th></tr></thead>
                                            <tbody>{order.items.map(item => (
                                                <tr key={item.productId}><td>{item.productName}</td>
                                                    <td>£{item.unitPrice.toFixed(2)}</td><td>{item.quantity}</td>
                                                    <td>£{item.totalPrice.toFixed(2)}</td></tr>
                                            ))}</tbody>
                                        </table>
                                    </div>
                                    <p className="my-orders-total"><span>Order total</span><strong>£{order.totalAmount.toFixed(2)}</strong></p>
                                </div>
                            </details>
                        ))}
                    </div>
                )}
            </div>
        </dialog>
    );
}
