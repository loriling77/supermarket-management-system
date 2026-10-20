import type { RegisterRequest } from '../types/types'

export async function registerUser(data: RegisterRequest) {
    const response = await fetch(
        "/api/auth/register",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(data)
        }
    );

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Registration failed.");
    }
}