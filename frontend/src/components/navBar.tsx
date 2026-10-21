import "../styles/navBar.css";
import { Link, NavLink } from 'react-router-dom'
import { LayoutDashboard, Package, Factory, Tags, Users } from "lucide-react";
import supermarketLogo from "../assets/supermarket.svg";


function Navbar() {


    return (
        <div className="sidebar">
            <div className="sidebar-logo">
                <img src={supermarketLogo} alt="nav-logo" width={100} height={100} />
            </div>

            <nav className="sidebar-menu" aria-label="Admin navigation">
                <NavLink to='/dashboard'>
                    <span className="nav-label"><LayoutDashboard size={18} aria-hidden="true" />Dashboard</span>
                </NavLink>
                <NavLink to='/home'>
                    <span className="nav-label"><Package size={18} aria-hidden="true" />Products</span>
                </NavLink>

                <NavLink to='/manufacture'>
                    <span className="nav-label"><Factory size={18} aria-hidden="true" />Manufacturers</span>
                </NavLink>
                <NavLink to='/category'>
                    <span className="nav-label"><Tags size={18} aria-hidden="true" />Categories</span>
                </NavLink>
                <NavLink to='/user'>
                    <span className="nav-label"><Users size={18} aria-hidden="true" />Customers</span>
                </NavLink>


            </nav>

            <div className='logout-btn'>
                <Link to='/login'>Logout</Link>
            </div>
        </div>
    );
}

export default Navbar;
