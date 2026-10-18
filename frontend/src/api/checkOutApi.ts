
import type { CartItem } from "../types/types";

interface CheckoutResponse {
    message: string;
    orderId: number;
    totalAmount: number;
}
export interface OrderItem {
    productId: number;
    productName: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
}

export interface UserOrder {
    id: number;
    createdAt: string;
    totalAmount: number;
    status: string;
    items: OrderItem[];
}


export async function getOrdersByUser(
    userId: string
): Promise<UserOrder[]> {

    const response = await fetch(
        `http://localhost:5252/api/order/user/${encodeURIComponent(userId)}`,
        {
            method: "GET",
            credentials: "include"
        }
    );

    if (!response.ok) {
        throw new Error(
            `Failed to load orders: ${response.status}`
        );
    }

    return response.json();
}

export async function checkout(
    cart: CartItem[]
): Promise<CheckoutResponse> {

    const response = await fetch(
        "http://localhost:5252/api/order/checkout",
        {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                items: cart.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity
                }))
            })
        }
    );

    if (!response.ok) {
        const message = await response.text();
        throw new Error(
            message || "Checkout failed."
        );
    }

    return response.json();
}
