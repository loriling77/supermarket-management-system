import type { Manufacture } from '../types/types';

const API_URL = "http://localhost:5252/api/manufacture";

export async function getManufactures(): Promise<Manufacture[]> {
    const response = await fetch(API_URL)
    if (!response.ok) {
        throw new Error("Failed to fetch manufactures")
    }
    return response.json()
}

export async function getManufacture(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/${id}`)
    if (!response.ok) {
        throw new Error("Failed to get this manufacture")
    }
}

export async function addManufacture(manufacture: Omit<Manufacture, "id">): Promise<Manufacture> {
    const response = await fetch(
        API_URL, {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(manufacture)
    }


    )
    if (!response.ok) {
        throw new Error("Failed to add manufacture");
    }
    return response.json()

}

export async function updateManufacture(
    manufacture: Manufacture
): Promise<void> {
    const response = await fetch(`${API_URL}/${manufacture.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(manufacture)
    })

    if (!response.ok) {
        throw new Error("Failed to update manufacture")
    }
}

export async function deleteManufacture(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    });

    if (!response.ok) {
        throw new Error("Failed to delete Manufacture");
    }
}