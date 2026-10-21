
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getCurrentUser } from "../api/authApi";

interface ProtectedRouteProps {
    requiredRole: "Admin" | "User";
}

export default function ProtectedRoute({
    requiredRole
}: ProtectedRouteProps) {
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        const checkAuth = async () => {
            try {
                const user = await getCurrentUser();

                if (active) {
                    setRole(user?.roles?.includes("Admin")
                        ? "Admin"
                        : user?.roles?.includes("User")
                            ? "User"
                            : null
                    );
                }
            } catch (error) {
                console.error("Authentication check failed:", error);

                if (active) {
                    setRole(null);
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void checkAuth();

        return () => {
            active = false;
        };
    }, []);

    if (loading) {
        return <p>Checking authentication...</p>;
    }

    if (!role) {
        return <Navigate to="/login" replace />;
    }

    if (role !== requiredRole) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
