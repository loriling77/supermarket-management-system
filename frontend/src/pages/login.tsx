
import "../styles/login.css";
import AuthLayout from "../components/AuthLayout";
import { ArrowRight, LockKeyhole } from "lucide-react";

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
        <AuthLayout>
            <div className="login-card">

                <div className="auth-form-heading">
                    <span className="auth-form-kicker">A FRESH START</span>
                    <h1>Welcome back.</h1>
                    <p>Sign in and pick up where you left off.</p>
                </div>

                <form
                    className="login-form"
                    onSubmit={handleSubmit}
                >
                    <div className="input-group">
                        <label htmlFor="email">
                            Email address
                        </label>

                        <input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
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
                            placeholder="Enter your password"
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
                        {loading ? "Signing in..." : "Sign in"}<ArrowRight size={17} aria-hidden="true" />
                    </button>
                </form>

                <div className="register-link">
                    <span>New to Supermarket? </span>
                    <Link to="/register">
                        Create an account
                    </Link>
                </div>
                <p className="auth-form-note"><LockKeyhole size={13} aria-hidden="true" /> Your basket starts here.</p>

            </div>
        </AuthLayout>
    );
}
