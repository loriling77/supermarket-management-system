
import NavBar from "../components/navBar";
import DashboardCard from "../components/dashboardCard";
import "../styles/home.css";
import "../styles/admin.css";
import "../styles/dashboard.css";

export default function Dashboard() {
    return (
        <div className="home-container admin-page dashboard-page">
            <aside className="home-sidebar">
                <NavBar />
            </aside>

            <DashboardCard />
        </div>
    );
}
