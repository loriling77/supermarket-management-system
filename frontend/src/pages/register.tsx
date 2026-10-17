import '../styles/login.css'
import '../styles/register.css'
import supermarketLogo from '../assets/supermarket.svg'

import { useState } from "react";
import type { SubmitEventHandler } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api/registerApi";

export default function Register() {
    const navigate = useNavigate();

    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit: SubmitEventHandler<HTMLFormElement> =
        async (e) => {
            e.preventDefault();

            if (password !== confirmPassword) {
                setError("Passwords do not match.");
                return;
            }

            setError("");
            setLoading(true);

            try {
                await registerUser({
                    userName: userName.trim(),
                    email: email.trim(),
                    phoneNumber: phoneNumber.trim(),
                    password: password
                });

                alert("Registration successful!");
                navigate("/login");

            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Registration failed."
                );
            } finally {
                setLoading(false);
            }
        };
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

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="username">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            placeholder="Please enter a username"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="email">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Please enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">
                            Telephone
                        </label>
                        <input


                            placeholder="Please enter your telephone number"
                            type="tel"
                            id="telephone"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
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
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="confirm-password">
                            Confirm Password
                        </label>
                        <input
                            id="confirm-password"

                            placeholder="Please confirm your password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && (
                        <p className="error-message" role="alert">
                            {error}
                        </p>
                    )}
                    <button
                        type="submit"
                        className="register-btn"
                        disabled={loading}
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>

                <div className="register-link">
                    <span>Already have an account? </span>
                    <Link to="/login">Login</Link>
                </div>

            </div>
        </div>
    )
}

