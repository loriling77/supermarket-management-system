import type { Product } from '../types/types'
const API_URL = "http://localhost:5252/api/category";

export async function getProducts(): Promise<Product[]> {
    const response = await fetch(API_URL)
    if (!response.ok) {
        throw new Error("Failed to get categories");

    }
    return response.json()
}

export async function getProduct(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/${id}`)
    if (!response.ok) {
        throw new Error("Failed to get this product")
    }
}

export async function addProduct(product: Omit<Product, "id">): Promise<Product> {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(product)
    })
    if (!response.ok) {
        throw new Error("Failed to add categories");

    }
    return response.json()
}

export async function updateProduct(product: Product): Promise<void> {
    const response = await fetch(`${API_URL}/${product.id}`, {
        method: "PUT",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(product)
    })
    if (!response.ok) {
        throw new Error("Failed to update product");

    }
    return response.json()
}

export async function deleteProduct(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" })

    if (!response.ok) {
        throw new Error("Failed to delete product");

    }
    return response.json()
}