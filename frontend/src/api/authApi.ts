const API_URL = "/api/auth";
import type { AuthUser } from '../types/types'



async function checkResponse(response: Response) {
    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || `Request failed: ${response.status}`);
    }
}

export async function register(email: string, password: string) {
    const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password })
    });

    await checkResponse(response);
}

export async function login(
    email: string,
    password: string
): Promise<AuthUser> {
    const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password })
    });

    await checkResponse(response);
    return response.json();
}

export async function getCurrentUser(): Promise<AuthUser | null> {
    const response = await fetch(`${API_URL}/me`, {
        credentials: "include"
    });

    if (response.status === 401) return null;

    await checkResponse(response);
    return response.json();
}

export async function logout(): Promise<void> {
    const response = await fetch(`${API_URL}/logout`, {
        method: "POST",
        credentials: "include"
    });

    await checkResponse(response);
}