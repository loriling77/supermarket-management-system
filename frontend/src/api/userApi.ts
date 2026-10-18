
export interface RegisteredUser {
    id: string;
    userName: string;
    email: string;
    phoneNumber: string | null;
    roles: string[];
}

export async function getUsers(): Promise<RegisteredUser[]> {
    const response = await fetch(
        "http://localhost:5252/api/users",
        {
            method: "GET",
            credentials: "include"
        }
    );

    if (!response.ok) {
        throw new Error(
            `Failed to load users: ${response.status}`
        );
    }

    return response.json();
}
