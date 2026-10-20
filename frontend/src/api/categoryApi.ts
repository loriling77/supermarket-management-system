import type { Category } from '../types/types';

const API_URL = "/api/category";

export async function getCategories(): Promise<Category[]> {
    const response = await fetch(API_URL)
    if (!response.ok) {
        throw new Error("Failed to fetch categories")
    }
    return response.json()
}

export async function getCategory(id: number): Promise<Category> {
    const response = await fetch(`${API_URL}/${id}`)
    if (!response.ok) {
        throw new Error("Failed to get this category")
    }
    return await response.json()
}

export async function addCategory(category: Omit<Category, "id">): Promise<Category> {
    const response = await fetch(
        API_URL, {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(category)
    }


    )
    if (!response.ok) {
        throw new Error("Failed to add category");
    }
    return response.json()

}

export async function updateCategory(
    category: Category
): Promise<void> {
    const response = await fetch(`${API_URL}/${category.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(category)
    })

    if (!response.ok) {
        throw new Error("Failed to update category")
    }
}

export async function deleteCategory(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    });

    if (!response.ok) {
        throw new Error("Failed to delete category");
    }
}