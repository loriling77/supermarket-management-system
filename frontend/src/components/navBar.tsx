import "../styles/navBar.css";
import { Link } from 'react-router-dom'
import supermarketLogo from "../assets/supermarket.svg";


function Navbar() {


    return (
        <div className="sidebar">
            <div className="sidebar-logo">
                <img src={supermarketLogo} alt="nav-logo" />
            </div>

            <div className="sidebar-menu">
                <Link to='/home'>
                    <h1>Product</h1>
                </Link>

                <Link to='/manufacture'>
                    <h1>Manufacture</h1>
                </Link>
                <Link to='/category'>
                    <h1>Category</h1>
                </Link>
                <Link to='/user'>
                    <h1>User</h1>
                </Link>


            </div>

            <div className='logout-btn'>
                <Link to='/login'>Logout</Link>
            </div>
        </div>
    );
}

export default Navbar;