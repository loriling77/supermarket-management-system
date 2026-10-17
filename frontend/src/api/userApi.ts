import type { User } from '../types/types';

const API_URL = "http://localhost:5252/api/user";

export async function getUsers(): Promise<User[]> {
    const response = await fetch(API_URL)
    if (!response.ok) {
        throw new Error("Failed to fetch users")
    }
    return response.json()
}

export async function getUser(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/${id}`)
    if (!response.ok) {
        throw new Error("Failed to get this user")
    }
}


export async function updateUser(
    user: User
): Promise<void> {
    const response = await fetch(`${API_URL}/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user)
    })

    if (!response.ok) {
        throw new Error("Failed to update user")
    }
}

