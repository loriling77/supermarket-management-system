
export interface AiProduct {
    id: number;
    productName: string;
    price: number;
    count: number;
}

export interface AiShoppingListItem {
    productId: number;
    productName: string;
    unitPrice: number;
    quantity: number;
    availableStock: number;
    totalPrice: number;
}

export interface AiShoppingList {
    budget: number | null;
    totalPrice: number;
    items: AiShoppingListItem[];
}

export interface AiChatResponse {
    reply: string;
    products: AiProduct[];
    shoppingList: AiShoppingList | null;
}

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:5252";

export async function sendAiMessage(
    message: string
): Promise<AiChatResponse> {
    const response = await fetch(
        `${API_BASE_URL}/api/ai/chat`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ message }),
        }
    );

    if (!response.ok) {
        throw new Error(
            `AI request failed: ${response.status}`
        );
    }

    return response.json();
}
