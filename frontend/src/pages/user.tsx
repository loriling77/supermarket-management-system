import NavBar from "../components/navBar";
import UserMenu from "../components/userMenu";

import "../styles/home.css";
import "../styles/userPage.css";

export default function User() {
    return (
        <div className="home-container user-page">
            <aside className="home-sidebar">
                <NavBar />
            </aside>

            <main className="home-main">
                <div className="home-header">
                    <h1>Dashboard</h1>
                    <p>Manage your Users</p>
                </div>

                <div className="home-content">
                    <section className="home-table-section">
                        <UserMenu />
                    </section>
                </div>
            </main>
        </div>
    );
}