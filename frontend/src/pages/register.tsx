
import "../styles/login.css";
import "../styles/register.css";
import AuthLayout from "../components/AuthLayout";

import { useState } from "react";
import type { SubmitEventHandler } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api/registerApi";

export default function Register() {
    const navigate = useNavigate();

    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [touched, setTouched] = useState({
        userName: false,
        email: false,
        password: false,
        confirmPassword: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const markTouched = (field: keyof typeof touched) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    // Validation rules
    const usernameValid = userName.trim().length >= 3;
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

    const passwordRules = [
        { label: "At least 6 characters", valid: password.length >= 6 },
        { label: "One uppercase letter", valid: /[A-Z]/.test(password) },
        { label: "One lowercase letter", valid: /[a-z]/.test(password) },
        { label: "One number", valid: /\d/.test(password) },
        { label: "One special character", valid: /[^A-Za-z0-9]/.test(password) },
    ];

    const passwordValid = passwordRules.every(rule => rule.valid);
    const confirmValid =
        confirmPassword.length > 0 && password === confirmPassword;

    const showError = (field: keyof typeof touched) =>
        touched[field] || submitted;

    const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        setSubmitted(true);
        setError("");

        if (!usernameValid || !emailValid || !passwordValid || !confirmValid) {
            return;
        }

        setLoading(true);

        try {
            await registerUser({
                userName: userName.trim(),
                email: email.trim(),
                password,
            });

            navigate("/login");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout register>
            <div className="login-card">
                <div className="auth-form-heading">
                    <h1>Create an account</h1>
                    <p>Register to shop and view your orders.</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit} noValidate>
                    {/* Username */}
                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            autoComplete="username"
                            value={userName}
                            placeholder="Enter username"
                            onChange={e => setUserName(e.target.value)}
                            onBlur={() => markTouched("userName")}
                            aria-invalid={showError("userName") && !usernameValid}
                            aria-describedby="username-feedback"
                        />
                        <div id="username-feedback">
                            {showError("userName") && (
                                <p className={usernameValid ? "valid-text" : "invalid-text"}>
                                    {usernameValid
                                        ? "✓ Looks good!"
                                        : "✕ Username must be at least 3 characters."}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Email */}
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            placeholder="Enter email"
                            onChange={e => setEmail(e.target.value)}
                            onBlur={() => markTouched("email")}
                            aria-invalid={showError("email") && !emailValid}
                            aria-describedby="email-feedback"
                        />
                        <div id="email-feedback">
                            {showError("email") && (
                                <p className={emailValid ? "valid-text" : "invalid-text"}>
                                    {emailValid
                                        ? "✓ Valid email address"
                                        : "✕ Please enter a valid email address."}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Password */}
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-field">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                value={password}
                                placeholder="Enter password"
                                onChange={e => setPassword(e.target.value)}
                                onBlur={() => markTouched("password")}
                                aria-invalid={showError("password") && !passwordValid}
                                aria-describedby="password-requirements"
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(prev => !prev)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>

                        {(password.length > 0 || showError("password")) && (
                            <div className="password-rules" id="password-requirements">
                                <p className="rules-title">Password requirements</p>
                                {passwordRules.map(rule => (
                                    <div
                                        key={rule.label}
                                        className={`rule ${rule.valid ? "rule-valid" : "rule-invalid"}`}
                                    >
                                        <span aria-hidden="true">
                                            {rule.valid ? "✓" : "○"}
                                        </span>
                                        <span>{rule.label}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="input-group">
                        <label htmlFor="confirm-password">Confirm Password</label>
                        <input
                            id="confirm-password"
                            type="password"
                            autoComplete="new-password"
                            value={confirmPassword}
                            placeholder="Confirm password"
                            onChange={e => setConfirmPassword(e.target.value)}
                            onBlur={() => markTouched("confirmPassword")}
                            aria-invalid={showError("confirmPassword") && !confirmValid}
                            aria-describedby="confirm-feedback"
                        />
                        <div id="confirm-feedback">
                            {showError("confirmPassword") && (
                                <p className={confirmValid ? "valid-text" : "invalid-text"}>
                                    {confirmValid
                                        ? "✓ Passwords match"
                                        : "✕ Passwords do not match."}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* API Error */}
                    {error && (
                        <div className="error-message" role="alert">
                            <span className="error-icon">!</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="register-btn"
                        disabled={loading}
                    >
                        {loading ? "Creating account..." : "Create account"}
                    </button>
                </form>

                <div className="register-link">
                    <span>Already have an account? </span>
                    <Link to="/login">Sign in</Link>
                </div>
            </div>
        </AuthLayout>
    );
}
