
import NavBar from "../components/navBar";
import UserMenu from "../components/userMenu";
import Search from "../components/search";
import OrderModal from "../components/orderModal";

import "../styles/home.css";
import "../styles/admin.css";
import "../styles/userPage.css";

import { useEffect, useState } from "react";
import { getUsers } from "../api/userApi";
import type { RegisteredUser } from "../api/userApi";

export default function User() {

    // Selected user for View Order modal
    const [selectedUser, setSelectedUser] =
        useState<RegisteredUser | null>(null);

    // All registered users
    const [users, setUsers] =
        useState<RegisteredUser[]>([]);

    // Search keyword
    const [search, setSearch] = useState<string>("");

    // Loading and error states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Load registered users
    useEffect(() => {
        const loadUsers = async () => {
            try {
                const data = await getUsers();
                setUsers(data);
            } catch (error) {
                console.error(
                    "Failed to load users:",
                    error
                );

                setError(
                    "Failed to load registered users."
                );
            } finally {
                setLoading(false);
            }
        };

        void loadUsers();
    }, []);

    // Open View Order modal
    const handleViewOrder = (user: RegisteredUser) => {
        console.log("View Order clicked:", user);

        setSelectedUser(user);
    };

    // Filter registered users
    const filteredUsers = users.filter(user => {
        const keyword = search.trim().toLowerCase();

        return (
            (user.userName ?? "")
                .toLowerCase()
                .includes(keyword)
        );
    });

    return (
        <>
            <div className="home-container admin-page user-page">
                <aside className="home-sidebar">
                    <NavBar />
                </aside>

                <main className="home-main">
                    <div className="home-header">
                        <span className="admin-eyebrow">STORE MANAGEMENT</span>
                        <h1>Customers</h1>
                        <p>Find registered customers and review their orders.</p>
                    </div>

                    <div className="home-content">
                        <Search onSearch={setSearch} />

                        <section className="home-table-section">
                            {loading ? (
                                <p>Loading users...</p>
                            ) : error ? (
                                <p>{error}</p>
                            ) : (
                                <UserMenu
                                    users={filteredUsers}
                                    onViewOrder={handleViewOrder}
                                />
                            )}
                        </section>
                    </div>
                </main>
            </div>

            {selectedUser && (
                <OrderModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                />
            )}
        </>
    );
}
