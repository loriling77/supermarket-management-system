
import "../styles/productForm.css";
import { ShoppingCart } from "lucide-react";

import { useEffect, useState } from "react";
import type { Product } from "../types/types";

interface UserOrderFormProps {
    selectedProduct: Product | null;
    availableStock: number;
    onAddToCart: (quantity: number) => void;
}

export default function UserOrderForm({
    selectedProduct,
    onAddToCart, availableStock
}: UserOrderFormProps) {

    const [quantity, setQuantity] = useState<string>("");
    const [error, setError] = useState<string>("");

    // Reset quantity when another product is selected
    useEffect(() => {
        setQuantity("");
        setError("");
    }, [selectedProduct?.id]);

    const handleAddToCart = () => {
        if (!selectedProduct) {
            setError("Please select a product first.");
            return;
        }

        const amount = Number(quantity);

        if (!Number.isInteger(amount) || amount <= 0) {
            setError("Please enter a valid quantity.");
            return;
        }

        if (amount > selectedProduct.count) {
            setError("Quantity exceeds available stock.");
            return;
        }

        onAddToCart(amount);
        setQuantity(quantity);
        setError("");
    };

    return (
        <div className="product-form-container">
            <form
                className="product-form"
                onSubmit={(e) => e.preventDefault()}
            >

                {/* Product Name */}
                <div className="input-group">
                    <label htmlFor="productname">
                        Product Name
                    </label>

                    <input
                        id="productname"
                        type="text"
                        value={selectedProduct?.productName ?? ""}
                        readOnly
                    />
                </div>

                {/* Price */}
                <div className="input-group">
                    <label htmlFor="price">
                        Price
                    </label>

                    <input
                        id="price"
                        type="text"
                        value={selectedProduct?.price ?? ""}
                        readOnly
                    />
                </div>

                {/* Purchase Quantity */}
                <div className="input-group">
                    <label htmlFor="count">
                        Count
                    </label>

                    <input
                        id="count"
                        type="number"
                        min="1"
                        max={selectedProduct?.count}
                        value={quantity}
                        onChange={(e) =>
                            setQuantity(e.target.value)
                        }
                        disabled={!selectedProduct}
                        required
                    />

                    {selectedProduct && (
                        <small>
                            Available stock: {availableStock}
                        </small>
                    )}
                </div>

                {error && (
                    <p className="error-message" role="alert">
                        {error}
                    </p>
                )}

                {/* Add to Cart */}
                <div className="form-actions-add-to-cart">
                    <button
                        type="button"
                        className="add-to-cart-btn"
                        onClick={handleAddToCart}
                        disabled={!selectedProduct}
                    >
                        <ShoppingCart size={18} />
                        Add to your Cart
                    </button>
                </div>

            </form>
        </div>
    );
}
