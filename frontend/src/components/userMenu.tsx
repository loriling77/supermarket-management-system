
import "../styles/productMenu.css";
import { useState } from 'react';
import OrderModal from './orderModal'

export default function UserMenu() {
    const [showOrder, setShowOrder] = useState<boolean>(false)
    return (
        <div className="product-menu-container">
            <div className="product-menu">
                <div className="product-menu-header">
                    <h1>User Management</h1>
                    <p>View and manage your users</p>
                </div>

                <div className="product-table-wrapper">
                    <table className="product-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Telephone</th>

                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>1</td>
                                <td>1</td>
                                <td>1</td>

                                <td>
                                    <button onClick={() => setShowOrder(true)} >View Order</button>
                                </td>
                                <OrderModal isOpen={showOrder} onClose={() => setShowOrder(false)}></OrderModal>

                            </tr>






                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
