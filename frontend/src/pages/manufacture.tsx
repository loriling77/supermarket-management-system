
import NavBar from "../components/navBar";
import ManufactureForm from "../components/manufactureForm";
import ManufactureMenu from "../components/manufactureMenu";

import "../styles/home.css";

export default function Manufacture() {
    return (
        <div className="home-container">
            <aside className="home-sidebar">
                <NavBar />
            </aside>

            <main className="home-main">
                <div className="home-header">
                    <h1>Dashboard</h1>
                    <p>Manage your Manufactures</p>
                </div>

                <div className="home-content">
                    <section className="home-form-section">
                        <ManufactureForm />
                    </section>

                    <section className="home-table-section">
                        <ManufactureMenu />
                    </section>
                </div>
            </main>
        </div>
    );
}
