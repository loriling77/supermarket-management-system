import '../styles/login.css'
import '../styles/register.css'
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
                    <p>Please Create a New Account.</p>
                </div>

                <form className="login-form">
                    <div className="input-group">
                        <label htmlFor="username">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            placeholder="Please enter a username"

                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="email">
                            Email
                        </label>
                        <input
                            id="email"
                            type="text"
                            placeholder="Please enter your email"

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

                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="confirm-password">
                            Confirm Password
                        </label>
                        <input
                            id="confirm-password"
                            type="confirm-password"
                            placeholder="Please confirm your password"

                            required
                        />
                    </div>

                    <button type="submit" className="register-btn">
                        Register
                    </button>
                </form>

                <div className="forgot-password-link">

                    <Link to="/reset">Forgot Password?</Link>
                </div>

            </div>
        </div>
    )
}

