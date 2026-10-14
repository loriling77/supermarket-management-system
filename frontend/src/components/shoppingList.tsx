
import "../styles/productMenu.css";

export default function ShoppingList() {
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
                            </tr>
                        </thead>

                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>iPhone 15</td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="shopping-list-footer">
                    <div className="shopping-total">
                        <span>Total Price:</span>
                        <strong>100</strong>
                    </div>

                    <button
                        type="button"
                        className="shopping-pay-btn"
                    >
                        Pay
                    </button>
                </div>

            </div>
        </div>
    );
}
