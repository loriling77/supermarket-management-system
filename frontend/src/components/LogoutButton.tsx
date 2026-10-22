import { useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../api/authApi";

export default function LogoutButton({ className, children }: { className?: string; children?: ReactNode }) {
    const navigate = useNavigate();
    const [pending, setPending] = useState(false);
    const [error, setError] = useState("");

    const handleLogout = async () => {
        if (pending) return;
        setPending(true);
        setError("");
        try {
            await logout();
            navigate("/login", { replace: true });
        } catch (error) {
            setError(error instanceof Error ? error.message : "Unable to sign out. Please try again.");
            setPending(false);
        }
    };

    return (
        <span className="logout-control">
            <button type="button" className={className} onClick={handleLogout} disabled={pending} aria-busy={pending}>
                {pending ? "Signing out…" : children ?? "Logout"}
            </button>
            {error && <span className="logout-error" role="alert">{error}</span>}
        </span>
    );
}
