
import "../styles/productMenu.css";
import type { RegisteredUser } from "../api/userApi";

interface UserMenuProps {
    users: RegisteredUser[];
    onViewOrder: (user: RegisteredUser) => void;
}

export default function UserMenu({
    users,
    onViewOrder
}: UserMenuProps) {
    return (
        <div className="product-menu-container">
            <div className="product-menu">

                <div className="product-menu-header">
                    <h2>Registered customers</h2>
                    <p>View and manage your users</p>
                </div>

                <div className="product-table-wrapper">
                    <table className="product-table">
                        <thead>
                            <tr>
                                <th>No.</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={5}>
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user, index) => (
                                    <tr key={user.id}>
                                        <td>{index + 1}</td>
                                        <td>{user.userName}</td>
                                        <td>{user.email}</td>

                                        <td>
                                            {user.roles.join(", ")}
                                        </td>

                                        <td>
                                            <button
                                                type="button"
                                                className="select-btn"
                                                onClick={() => onViewOrder(user)}
                                            >
                                                View Orders
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
