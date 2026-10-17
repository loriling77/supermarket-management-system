
import "../styles/login.css";
import supermarketLogo from "../assets/supermarket.svg";

import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import type { SubmitEventHandler } from "react";

import { login } from "../api/authApi";

export default function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit: SubmitEventHandler<HTMLFormElement> =
        async (e) => {
            e.preventDefault();

            setError("");
            setLoading(true);

            try {
                const user = await login(email, password);
                console.log("Logged in user", user)

                if (user.roles.includes("Admin")) {
                    navigate("/home", { replace: true });
                } else if (user.roles.includes("User")) {
                    navigate("/userOrder", { replace: true });
                } else {
                    setError("Your account does not have an assigned role.");
                }


            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Login failed"
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
                    <p>Welcome back! Please login.</p>
                </div>

                <form
                    className="login-form"
                    onSubmit={handleSubmit}
                >
                    <div className="input-group">
                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            placeholder="Please enter your email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
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
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                        />
                    </div>

                    {error && (
                        <p className="error-message" role="alert">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="login-btn"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <div className="register-link">
                    <span>Are you new? </span>
                    <Link to="/register">
                        Create an account
                    </Link>
                </div>

            </div>
        </div>
    );
}
