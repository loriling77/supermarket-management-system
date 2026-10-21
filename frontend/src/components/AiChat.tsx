
import { useEffect, useRef, useState } from "react";
import type { SubmitEventHandler } from "react";

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
};

type AiChatProps = {
    onAddToCart: (product: AiProduct) => boolean;
    onAddAllToCart: (list: AiShoppingList) => boolean;
};

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
    }, [messages, loading, cartMessage, open]);

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

    const handleAddProduct = (product: AiProduct) => {
        const success = onAddToCart(product);

        setCartMessage(
            success
                ? `${product.productName} added to cart!`
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
                            <strong>🛒 Supermarket AI</strong>
                            <p>Your shopping assistant</p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            aria-label="Close chat"
                        >
                            ✕
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

                                                        <button
                                                            type="button"
                                                            className="ai-add-cart-btn"
                                                            onClick={() =>
                                                                handleAddProduct(product)
                                                            }
                                                        >
                                                            🛒 Add to Cart
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
                                            <h4>🛒 AI Shopping List</h4>

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

                                            <button
                                                type="button"
                                                className="ai-add-all-btn"
                                                onClick={() =>
                                                    handleAddAll(
                                                        message.shoppingList!
                                                    )
                                                }
                                            >
                                                🛒 Add All to Cart
                                            </button>
                                        </div>
                                    )}
                            </div>
                        ))}

                        {loading && (
                            <div className="ai-message assistant">
                                <span className="ai-loading">
                                    🤖 Thinking...
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
                            {loading ? "..." : "Send"}
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
                {open ? "✕" : "🤖"}
            </button>
        </div>
    );
}
