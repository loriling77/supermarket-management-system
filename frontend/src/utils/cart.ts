import type { CartItem, Product } from "../types/types";

export type CartProduct = Pick<Product, "id" | "productName" | "price" | "count">;

export function addProductToCart(
    cart: CartItem[], product: CartProduct, quantity: number
): CartItem[] {
    if (!Number.isSafeInteger(quantity) || quantity <= 0) return cart;

    const existing = cart.find(item => item.productId === product.id);
    const totalQuantity = (existing?.quantity ?? 0) + quantity;
    if (!Number.isSafeInteger(totalQuantity) || totalQuantity > product.count) return cart;

    if (existing) {
        return cart.map(item => item.productId === product.id
            ? { ...item, quantity: totalQuantity }
            : item);
    }

    return [...cart, {
        productId: product.id,
        productName: product.productName,
        unitPrice: product.price,
        quantity,
    }];
}
