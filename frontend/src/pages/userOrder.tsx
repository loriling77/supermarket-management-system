
import UserOrderNavBar from "../components/userOrderNavBar";
import UserOrderForm from "../components/userOrderForm";
import UserOrderMenu from "../components/userOrderMenu";
import ShoppingList from "../components/shoppingList";
import Search from "../components/search";
import { checkout } from "../api/checkOutApi";
import { useState } from "react";
import type { Product, CartItem } from "../types/types";

import "../styles/home.css";
import "../styles/userOrder.css";

export default function UserOrder() {

    const getAvailableStock = (product: Product) => {
        const cartItem = cart.find(
            item => item.productId === product.id
        );

        return product.count - (cartItem?.quantity ?? 0);
    };
    // Search keyword
    const [search, setSearch] = useState<string>("");

    // Selected product
    const [selectedProduct, setSelectedProduct] =
        useState<Product | null>(null);

    // Shopping cart
    const [cart, setCart] = useState<CartItem[]>([]);

    const [paying, setPaying] = useState(false);
    const [paymentMessage, setPaymentMessage] = useState("");

    const handlePay = async () => {
        if (cart.length === 0 || paying) {
            return;
        }

        setPaying(true);
        setPaymentMessage("");

        try {
            const result = await checkout(cart);

            setPaymentMessage(
                `Payment successful! Order ${result.orderId}. Total: ${result.totalAmount.toFixed(2)}`
            );

            // Clear shopping cart after successful checkout
            setCart([]);
            setSelectedProduct(null);

        } catch (error) {
            console.error(error);

            setPaymentMessage(
                error instanceof Error
                    ? error.message
                    : "Payment failed."
            );
        } finally {
            setPaying(false);
        }
    };

    // Add selected product to shopping cart
    const handleAddToCart = (quantity: number) => {
        if (!selectedProduct) {
            return;
        }

        if (!Number.isInteger(quantity) || quantity <= 0) {
            alert("Please enter a valid quantity.");
            return;
        }

        const existingItem = cart.find(
            item => item.productId === selectedProduct.id
        );

        const currentQuantity = existingItem?.quantity ?? 0;

        if (
            currentQuantity + quantity >
            selectedProduct.count
        ) {
            alert("Quantity exceeds available stock.");
            return;
        }

        setCart(previousCart => {
            const exists = previousCart.some(
                item => item.productId === selectedProduct.id
            );

            if (exists) {
                return previousCart.map(item =>
                    item.productId === selectedProduct.id
                        ? {
                            ...item,
                            quantity: quantity
                        }
                        : item
                );
            }

            return [
                ...previousCart,
                {
                    productId: selectedProduct.id,
                    productName: selectedProduct.productName,
                    unitPrice: selectedProduct.price,
                    quantity: quantity
                }
            ];
        });
    };

    // Remove product from shopping cart
    const handleRemoveFromCart = (productId: number) => {
        setCart(previousCart =>
            previousCart.filter(
                item => item.productId !== productId
            )
        );
    };

    return (
        <div className="home-container user-order-page">
            <aside className="home-sidebar">
                <UserOrderNavBar />
            </aside>

            <main className="home-main">
                <div className="home-header">
                    <h1>Start your shopping!</h1>
                </div>

                <div className="home-content">
                    <div className="home-right-column">
                        <section>
                            <Search onSearch={setSearch} />
                        </section>

                        <section className="home-table-section">
                            <UserOrderMenu
                                search={search}
                                onSelect={setSelectedProduct}
                                cart={cart}
                            />
                        </section>
                    </div>

                    <div className="home-left-column">
                        <section className="home-form-section">
                            <UserOrderForm
                                selectedProduct={selectedProduct}
                                availableStock={
                                    selectedProduct
                                        ? getAvailableStock(selectedProduct)
                                        : 0
                                }
                                onAddToCart={handleAddToCart}
                            />
                        </section>

                        <section className="home-table-section">
                            <ShoppingList
                                cart={cart}
                                onRemove={handleRemoveFromCart}
                                onPay={handlePay}
                                paying={paying}
                            />
                            {paymentMessage && (
                                <p role="status">{paymentMessage}</p>
                            )}
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
