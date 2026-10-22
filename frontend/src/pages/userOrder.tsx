
import UserOrderMenu from "../components/userOrderMenu";
import ShoppingList from "../components/shoppingList";
import MyOrdersDialog from "../components/MyOrdersDialog";
import Search from "../components/search";
import { checkout } from "../api/checkOutApi";
import { useEffect, useState } from "react";
import type { AuthUser, CartItem } from "../types/types";
import LogoutButton from "../components/LogoutButton";
import { getCurrentUser } from "../api/authApi";
import { LogOut, ReceiptText, ShoppingBag, UserRound } from "lucide-react";
import supermarketLogo from "../assets/supermarket.svg";
import { addProductToCart } from "../utils/cart";
import type { CartProduct } from "../utils/cart";
import AiChat from "../components/AiChat";
import type { AiShoppingList, AiProduct } from "../api/aiApi";

import "../styles/home.css";
import "../styles/userOrder.css";






export default function UserOrder() {
    const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
    const [userLoading, setUserLoading] = useState(true);

    useEffect(() => {
        let active = true;
        const loadUser = async () => {
            try {
                const user = await getCurrentUser();
                if (active) setCurrentUser(user);
            } catch {
                // Keep shopping content accessible while account details reload.
            } finally {
                if (active) setUserLoading(false);
            }
        };
        void loadUser();
        return () => { active = false; };
    }, []);

    const displayName = currentUser?.userName?.trim() || currentUser?.email || "Customer";

    // Search keyword
    const [search, setSearch] = useState<string>("");

    // Shopping cart
    const [cart, setCart] = useState<CartItem[]>([]);

    const [productsRevision, setProductsRevision] = useState(0);

    const [paying, setPaying] = useState(false);
    const [paymentMessage, setPaymentMessage] = useState("");
    const [showOrders, setShowOrders] = useState(false);
    const [latestOrderId, setLatestOrderId] = useState<number | null>(null);

    const handlePay = async () => {
        if (cart.length === 0 || paying) {
            return;
        }

        setPaying(true);
        setPaymentMessage("");
        setLatestOrderId(null);

        try {
            const result = await checkout(cart);

            setPaymentMessage(
                `Payment successful! Order ${result.orderId}. Total: ${result.totalAmount.toFixed(2)}`
            );

            setLatestOrderId(result.orderId);

            // Clear shopping cart after successful checkout
            setCart([]);
            setProductsRevision(value => value + 1);

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

    // Repeated additions accumulate, while the state update enforces stock limits.
    const handleAddToCart = (product: CartProduct, quantity: number): boolean => {
        if (paying || addProductToCart(cart, product, quantity) === cart) return false;
        setCart(previous => addProductToCart(previous, product, quantity));
        return true;
    };

    // Remove product from shopping cart
    const handleRemoveFromCart = (productId: number) => {
        if (paying) return;
        setCart(previousCart =>
            previousCart.filter(
                item => item.productId !== productId
            )
        );
    };

    const handleAiAddToCart = (product: AiProduct, quantity: number): boolean =>
        handleAddToCart(product, quantity);

    const handleAiAddAllToCart = (
        list: AiShoppingList
    ): boolean => {
        if (!list.items.length || paying) {
            return false;
        }

        // Check every product BEFORE updating the cart.
        // If any item fails, nothing is added.
        const valid = list.items.every(item => {
            const existingItem = cart.find(
                cartItem =>
                    cartItem.productId === item.productId
            );

            const currentQuantity =
                existingItem?.quantity ?? 0;

            return (
                Number.isInteger(item.quantity) &&
                item.quantity > 0 &&
                currentQuantity + item.quantity <=
                item.availableStock
            );
        });

        if (!valid) {
            return false;
        }

        // All items passed validation.
        // Add the entire list in one state update.
        setCart(previousCart => {
            let updatedCart = [...previousCart];

            for (const item of list.items) {
                const existingIndex = updatedCart.findIndex(
                    cartItem =>
                        cartItem.productId === item.productId
                );

                if (existingIndex >= 0) {
                    updatedCart = updatedCart.map(
                        (cartItem, index) =>
                            index === existingIndex
                                ? {
                                    ...cartItem,
                                    quantity:
                                        cartItem.quantity +
                                        item.quantity,
                                }
                                : cartItem
                    );
                } else {
                    updatedCart.push({
                        productId: item.productId,
                        productName: item.productName,
                        unitPrice: item.unitPrice,
                        quantity: item.quantity,
                    });
                }
            }

            return updatedCart;
        });

        return true;
    };



    const cartQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="home-container user-order-page">
            <main className="home-main">
                <header className="user-order-topbar">
                    <div className="user-order-brand">
                        <img src={supermarketLogo} alt="" width={40} height={40} />
                        <span>Supermarket</span>
                    </div>
                    <div className="user-order-account">
                        <div className="user-order-profile">
                            <span className="user-order-avatar"><UserRound size={19} aria-hidden="true" /></span>
                            <div>
                                <span className="user-order-account-label">Signed in as</span>
                                <strong title={userLoading ? undefined : displayName}>
                                    {userLoading ? "Loading…" : displayName}
                                </strong>
                            </div>
                        </div>
                        <button type="button" className="user-order-history-button" disabled={paying}
                            onClick={() => setShowOrders(true)}>
                            <ReceiptText size={16} aria-hidden="true" /><span>My orders</span>
                        </button>
                        <LogoutButton className="user-order-logout">
                            <LogOut size={16} aria-hidden="true" /><span>Logout</span>
                        </LogoutButton>
                    </div>
                </header>

                <div className="home-header">
                    <div>
                        <p className="user-order-eyebrow">A LITTLE FRESHNESS, EVERY DAY</p>
                        <h1>Let’s fill your basket.</h1>
                        <p>Choose your favourites, pick a quantity, and we’ll keep track of the rest.</p>
                    </div>
                    <div className="user-order-basket-count" aria-live="polite">
                        <ShoppingBag size={18} aria-hidden="true" />
                        <span>{cartQuantity} {cartQuantity === 1 ? "item" : "items"} in your cart</span>
                    </div>
                </div>

                <div className="home-content">
                    <div className="home-right-column">
                        <section className="user-order-catalog" aria-label="Browse products">
                            <Search onSearch={setSearch} />
                            <UserOrderMenu
                                key={productsRevision}
                                search={search}
                                onAddToCart={handleAddToCart}
                                cart={cart}
                                disabled={paying}
                            />
                        </section>
                    </div>
                    <div className="home-left-column user-order-cart-column">
                        <ShoppingList cart={cart} onRemove={handleRemoveFromCart}
                            onPay={handlePay} paying={paying} />
                        {paymentMessage && (
                            <div className="user-order-feedback" role="status">
                                <p>{paymentMessage}</p>
                                {latestOrderId !== null && (
                                    <button type="button" className="user-order-view-order" onClick={() => setShowOrders(true)}>
                                        View my order
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            {showOrders && <MyOrdersDialog latestOrderId={latestOrderId} onClose={() => setShowOrders(false)} />}
            <AiChat onAddToCart={handleAiAddToCart} onAddAllToCart={handleAiAddAllToCart} />
        </div>
    );
}
