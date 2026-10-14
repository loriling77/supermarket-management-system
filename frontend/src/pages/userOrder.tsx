
import UserOrderNavBar from "../components/userOrderNavBar";
import UserOrderForm from "../components/userOrderForm";
import UserOrderMenu from "../components/userOrderMenu";
import ShoppingList from "../components/shoppingList";
import Search from "../components/search";

import "../styles/home.css";

export default function UserOrder() {
    return (
        <div className="home-container">
            <aside className="home-sidebar">
                <UserOrderNavBar />
            </aside>

            <main className="home-main">
                <div className="home-header">
                    <h1>Dashboard</h1>
                    <p>Manage your products and inventory</p>
                </div>

                <div className="home-content">

                    {/* 左侧 */}
                    <div className="home-left-column">
                        <section className="home-form-section">
                            <UserOrderForm />
                        </section>

                        <section className="home-table-section">
                            <ShoppingList />
                        </section>
                    </div>

                    {/* 右侧 */}
                    <div className="home-right-column">
                        <section>
                            <Search />
                        </section>

                        <section className="home-table-section">
                            <UserOrderMenu />
                        </section>
                    </div>

                </div>
            </main>
        </div>
    );
}
