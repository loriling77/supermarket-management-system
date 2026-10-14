
import NavBar from "../components/navBar";
import CategoryForm from "../components/categoryForm";
import CategoryMenu from "../components/categoryMenu";

import "../styles/home.css";

export default function Category() {
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
                        <CategoryForm />
                    </section>

                    <section className="home-table-section">
                        <CategoryMenu />
                    </section>
                </div>
            </main>
        </div>
    );
}
