
import UserOrderNavBar from "../components/userOrderNavBar";
import UserOrderForm from "../components/userOrderForm";
import UserOrderMenu from "../components/userOrderMenu";
import ShoppingList from "../components/shoppingList";
import Search from "../components/search";
import { useState } from 'react';

import "../styles/home.css";
import "../styles/userOrder.css";

export default function UserOrder() {

    const [search, setSearch] = useState<string>("")

    return (
        <div className="home-container user-order-page">
            <aside className="home-sidebar">
                <UserOrderNavBar />
            </aside>

            <main className="home-main">

                <div className="home-header">
                    <h1>Start your shopping!</h1>
                </div>


                <div className="home-content">


                    <div className="home-right-column">
                        <section>
                            <Search onSearch={setSearch} />
                        </section>
                        <section className="home-table-section">
                            <UserOrderMenu
                                search={search} />
                        </section>
                    </div>
                    <div className="home-left-column">
                        <section className="home-form-section">
                            <UserOrderForm />
                        </section>
                        <section className="home-table-section">
                            <ShoppingList />
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
