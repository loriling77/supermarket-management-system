
import type { Product } from "../types/types";

const API_URL = "http://localhost:5252/api/product";

export type ProductRequest = Pick<
    Product,
    "productName" | "manufactureId" | "categoryId" | "price" | "count"
>;

async function handleApiError(
    response: Response,
    action: string
): Promise<void> {
    if (response.status === 401) {
        throw new Error("Session expired. Please login again.");
    }

    if (response.status === 403) {
        throw new Error("You do not have permission to manage products.");
    }

    if (response.status === 409 && action !== "delete product") {
        throw new Error("Product already exists.");
    }

    let message = `Failed to ${action}.`;

    try {
        const data = await response.json();

        if (typeof data.message === "string") {
            message = data.message;
        }
    } catch {
        // Response may not contain JSON
    }

    throw new Error(message);
}

// GET all products
export async function getProducts(): Promise<Product[]> {
    const response = await fetch(API_URL, {
        method: "GET",
        credentials: "include"
    });

    if (!response.ok) {
        await handleApiError(response, "get products");
    }

    return response.json();
}

// GET product by ID
export async function getProduct(id: number): Promise<Product> {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "GET",
        credentials: "include"
    });

    if (!response.ok) {
        await handleApiError(response, "get product");
    }

    return response.json();
}

// POST add product
export async function addProduct(
    data: ProductRequest
): Promise<Product> {
    const response = await fetch(API_URL, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        await handleApiError(response, "add product");
    }

    return response.json();
}

// PUT update product
export async function updateProduct(
    product: Product
): Promise<void> {
    const response = await fetch(`${API_URL}/${product.id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(product)
    });

    if (!response.ok) {
        await handleApiError(response, "update product");
    }
}

// DELETE product
export async function deleteProduct(
    id: number
): Promise<void> {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        credentials: "include"
    });

    if (!response.ok) {
        await handleApiError(response, "delete product");
    }
}
