import "../styles/navBar.css";
import { Link } from 'react-router-dom'
import supermarketLogo from "../assets/supermarket.svg";


export default function UserOrderNavbar() {


    return (
        <div className="sidebar">
            <div className="sidebar-logo">
                <img src={supermarketLogo} alt="nav-logo" />
            </div>

            <div className="sidebar-menu">
                <Link to='/home'>
                    <h1>Order Payment</h1>
                </Link>



            </div>

            <div className='logout-btn'>
                <Link to='/login'>Logout</Link>
            </div>
        </div>
    );
}

