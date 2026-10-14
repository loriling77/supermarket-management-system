
import "../styles/productMenu.css";

export default function UserOrderMenu() {
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
                            <tr>
                                <td>1</td>
                                <td>iPhone 15</td>

                            </tr>






                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
