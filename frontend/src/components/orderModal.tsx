
import "../styles/productMenu.css";
import "../styles/orderModal.css";

interface OrderModalProps {
    isOpen: boolean;
    onClose: () => void
}

export default function OrderModal({ isOpen, onClose }: OrderModalProps) {
    if (!isOpen) return null;

    return (
        <div
            className="order-modal-overlay"
            onClick={onClose}
        >
            <div
                className="order-modal-content"
                role="dialog"
                aria-modal="true"
                aria-labelledby="order-modal-title"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="product-menu-header order-modal-header">
                    <h1 id="order-modal-title">Order List</h1>

                    <button
                        type="button"
                        className="order-modal-close"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        &times;
                    </button>
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
                                <th>Created Time</th>
                                <th>Created Date</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>iPhone 15</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
