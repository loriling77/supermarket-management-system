
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/login";
import Register from "./pages/register";
import Home from "./pages/home";
import User from "./pages/user";
import Category from "./pages/category";
import Manufacture from "./pages/manufacture";
import UserOrder from "./pages/userOrder";
import Dashboard from "./pages/dashboard";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <Routes>
            {/* Public pages */}
            <Route
                path="/"
                element={<Navigate to="/login" replace />}
            />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin-only pages */}
            <Route element={<ProtectedRoute requiredRole="Admin" />}>
                <Route
                    path="/admin"
                    element={<Navigate to="/dashboard" replace />}
                />

                <Route path="/home" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/user" element={<User />} />
                <Route path="/category" element={<Category />} />
                <Route path="/manufacture" element={<Manufacture />} />
            </Route>

            {/* User-only page */}
            <Route element={<ProtectedRoute requiredRole="User" />}>
                <Route path="/userOrder" element={<UserOrder />} />
            </Route>

            {/* Unknown pages */}
            <Route
                path="*"
                element={<Navigate to="/" replace />}
            />
        </Routes>
    );
}

export default App;
