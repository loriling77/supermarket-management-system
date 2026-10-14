import '../styles/login.css'
import supermarketLogo from '../assets/supermarket.svg'
import { Link } from 'react-router-dom'

export default function Login() {
    return (
        <div className="login-container">
            <div className="login-card">

                <div className="sm-logo">
                    <img
                        src={supermarketLogo}
                        alt="Supermarket Logo"
                    />
                    <h1>Supermarket</h1>
                    <p>Welcome back! Please login.</p>
                </div>

                <form className="login-form">
                    <div className="input-group">
                        <label htmlFor="username">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            placeholder="Please enter your username"
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Please enter your password"
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    <button type="submit" className="login-btn">
                        Login
                    </button>
                </form>

                <div className="register-link">
                    <span>Are you new? </span>
                    <Link to="/register">Create an account</Link>
                </div>

            </div>
        </div>
    )
}

