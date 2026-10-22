
import { useEffect, useRef, useState } from "react";
import type { SubmitEventHandler } from "react";
import { Bot, Send, ShoppingCart, Sparkles, X } from "lucide-react";

import {
    sendAiMessage,
    type AiProduct,
    type AiShoppingList,
} from "../api/aiApi";

import "../styles/aiChat.css";

type Message = {
    role: "user" | "assistant";
    content: string;
    products?: AiProduct[];
    shoppingList?: AiShoppingList | null;
    quantities?: Record<number, number>;
};

type AiChatProps = {
    onAddToCart: (product: AiProduct, quantity: number) => boolean;
    onAddAllToCart: (list: AiShoppingList) => boolean;
};

function QuantityInput({ name, value, stock, onChange }: {
    name: string;
    value: number;
    stock: number;
    onChange: (quantity: number) => void;
}) {
    const [empty, setEmpty] = useState(false);

    return (
        <label className="ai-quantity-control">
            Quantity
            <input type="number" min={1} max={stock} step={1}
                aria-label={`Quantity for ${name}`}
                value={empty ? "" : value}
                onBlur={() => setEmpty(false)}
                onChange={event => {
                    if (event.target.value === "") {
                        setEmpty(true);
                        return;
                    }
                    const quantity = event.target.valueAsNumber;
                    setEmpty(false);
                    if (Number.isSafeInteger(quantity) && quantity >= 1 && quantity <= stock) {
                        onChange(quantity);
                    }
                }} />
        </label>
    );
}

export default function AiChat({
    onAddToCart,
    onAddAllToCart,
}: AiChatProps) {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [cartMessage, setCartMessage] = useState("");

    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content:
                "Hello! 👋 I'm your Supermarket Assistant. " +
                "Ask me about products or request a shopping list!",
        },
    ]);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (open) {
            messagesEndRef.current?.scrollIntoView({
                behavior: "smooth",
            });
        }
    }, [messages.length, loading, open]);

    useEffect(() => {
        if (open && cartMessage) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [cartMessage, open]);

    const handleSubmit: SubmitEventHandler<HTMLFormElement> =
        async (event) => {
            event.preventDefault();

            const text = input.trim();

            if (!text || loading) {
                return;
            }

            setMessages(previous => [
                ...previous,
                {
                    role: "user",
                    content: text,
                },
            ]);

            setInput("");
            setCartMessage("");
            setLoading(true);

            try {
                const result = await sendAiMessage(text);

                setMessages(previous => [
                    ...previous,
                    {
                        role: "assistant",
                        content: result.reply,
                        products: result.products ?? [],
                        shoppingList: result.shoppingList ?? null,
                    },
                ]);
            } catch (error) {
                console.error(error);

                setMessages(previous => [
                    ...previous,
                    {
                        role: "assistant",
                        content:
                            "Sorry, I couldn't connect to the assistant. " +
                            "Please try again.",
                    },
                ]);
            } finally {
                setLoading(false);
            }
        };

    const handleQuantityChange = (messageIndex: number, productId: number, quantity: number, stock: number) => {
        if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > stock) return;
        setCartMessage("");
        setMessages(previous => previous.map((message, index) => {
            if (index !== messageIndex) return message;
            if (!message.shoppingList) {
                return { ...message, quantities: { ...message.quantities, [productId]: quantity } };
            }
            const items = message.shoppingList.items.map(item => item.productId === productId
                ? { ...item, quantity, totalPrice: Math.round(item.unitPrice * quantity * 100) / 100 }
                : item);
            return { ...message, shoppingList: {
                ...message.shoppingList, items,
                totalPrice: Math.round(items.reduce((sum, item) => sum + item.totalPrice, 0) * 100) / 100,
            } };
        }));
    };

    const handleAddProduct = (product: AiProduct, quantity: number) => {
        const success = onAddToCart(product, quantity);

        setCartMessage(
            success
                ? `${quantity} × ${product.productName} added to cart!`
                : "Cannot add product. Stock may be exceeded."
        );
    };

    const handleAddAll = (list: AiShoppingList) => {
        const success = onAddAllToCart(list);

        setCartMessage(
            success
                ? "All shopping list items added to cart!"
                : "Cannot add all items. Please check stock."
        );
    };

    return (
        <div className="ai-chat-root">
            {open && (
                <section className="ai-chat-panel">
                    <div className="ai-chat-header">
                        <div>
                            <strong><Sparkles size={18} aria-hidden="true" /> Supermarket Assistant</strong>
                            <p>Product advice & shopping lists</p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            aria-label="Close chat"
                        >
                            <X size={20} aria-hidden="true" />
                        </button>
                    </div>

                    <div className="ai-chat-messages">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`ai-message ${message.role}`}
                            >
                                <div className="ai-message-text">
                                    {message.content}
                                </div>

                                {/* Normal product cards */}
                                {message.role === "assistant" &&
                                    message.products &&
                                    message.products.length > 0 && (
                                        <div className="ai-product-list">
                                            {message.products.map(
                                                product => (
                                                    <div
                                                        key={product.id}
                                                        className="ai-product-card"
                                                    >
                                                        <strong>
                                                            {product.productName}
                                                        </strong>

                                                        <p className="ai-product-price">
                                                            £
                                                            {product.price.toFixed(2)}
                                                        </p>

                                                        <small>
                                                            Stock: {product.count}
                                                        </small>

                                                        <QuantityInput name={product.productName}
                                                            value={message.quantities?.[product.id] ?? 1} stock={product.count}
                                                            onChange={quantity => handleQuantityChange(index, product.id, quantity, product.count)} />

                                                        <button
                                                            type="button"
                                                            className="ai-add-cart-btn"
                                                            onClick={() =>
                                                                handleAddProduct(product, message.quantities?.[product.id] ?? 1)
                                                            }
                                                        >
                                                            <ShoppingCart size={15} aria-hidden="true" /> Add to Cart
                                                        </button>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}

                                {/* AI Shopping List */}
                                {message.role === "assistant" &&
                                    message.shoppingList &&
                                    message.shoppingList.items.length > 0 && (
                                        <div className="ai-shopping-list">
                                            <h4>Suggested shopping list</h4>

                                            {message.shoppingList.items.map(
                                                item => (
                                                    <div
                                                        key={item.productId}
                                                        className="ai-shopping-item"
                                                    >
                                                        <div>
                                                            <strong>
                                                                {item.productName}
                                                            </strong>

                                                            <small>
                                                                £
                                                                {item.unitPrice.toFixed(2)}
                                                                {" × "}
                                                                {item.quantity}
                                                            </small>
                                                            <QuantityInput name={item.productName}
                                                                value={item.quantity} stock={item.availableStock}
                                                                onChange={quantity => handleQuantityChange(index, item.productId, quantity, item.availableStock)} />
                                                        </div>

                                                        <strong>
                                                            £
                                                            {item.totalPrice.toFixed(2)}
                                                        </strong>
                                                    </div>
                                                )
                                            )}

                                            <div className="ai-shopping-total">
                                                <strong>Total</strong>

                                                <strong>
                                                    £
                                                    {message.shoppingList.totalPrice.toFixed(2)}
                                                </strong>
                                            </div>

                                            {message.shoppingList.budget !== null && (
                                                <p className="ai-shopping-budget">
                                                    Budget: £
                                                    {message.shoppingList.budget.toFixed(2)}
                                                </p>
                                            )}

                                            {message.shoppingList.budget !== null && message.shoppingList.totalPrice > message.shoppingList.budget && (
                                                <p className="ai-budget-warning" role="status">This list is now over your budget.</p>
                                            )}

                                            <button
                                                type="button"
                                                className="ai-add-all-btn"
                                                onClick={() =>
                                                    handleAddAll(
                                                        message.shoppingList!
                                                    )
                                                }
                                            >
                                                <ShoppingCart size={15} aria-hidden="true" /> Add All to Cart
                                            </button>
                                        </div>
                                    )}
                            </div>
                        ))}

                        {loading && (
                            <div className="ai-message assistant">
                                <span className="ai-loading">
                                    Thinking...
                                </span>
                            </div>
                        )}

                        {cartMessage && (
                            <div
                                className="ai-cart-feedback"
                                role="status"
                            >
                                {cartMessage}
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    <form
                        className="ai-chat-form"
                        onSubmit={handleSubmit}
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={event =>
                                setInput(event.target.value)
                            }
                            placeholder="Ask about products..."
                            maxLength={500}
                        />

                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                        >
                            <Send size={16} aria-hidden="true" /> {loading ? "..." : "Send"}
                        </button>
                    </form>
                </section>
            )}

            <button
                type="button"
                className="ai-chat-toggle"
                onClick={() => setOpen(previous => !previous)}
                aria-label={
                    open ? "Close assistant" : "Open assistant"
                }
                aria-expanded={open}
            >
                {open ? <X size={24} aria-hidden="true" /> : <Bot size={26} aria-hidden="true" />}
            </button>
        </div>
    );
}
