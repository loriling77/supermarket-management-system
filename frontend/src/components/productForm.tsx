
import "../styles/productForm.css";

import { useState, useEffect } from "react";
import type { SubmitEventHandler } from "react";

import type {
    Product,
    Category,
    Manufacture
} from "../types/types";

import { getManufactures } from "../api/manufactureApi";
import { getCategories } from "../api/categoryApi";

interface ProductFormProps {
    onAddProduct: (product: Omit<Product, "id">) => Promise<void>;
    selectProduct: Product | null;
    onSaveProduct: (product: Product) => Promise<void>;
}

export default function ProductForm({
    onAddProduct,
    selectProduct,
    onSaveProduct
}: ProductFormProps) {

    const [productName, setProductName] = useState("");
    const [manufactureId, setManufactureId] = useState("");
    const [categoryId, setCategoryId] = useState("");

    const [manufactures, setManufactures] = useState<Manufacture[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    const [price, setPrice] = useState("");
    const [count, setCount] = useState("");

    const [submitError, setSubmitError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const hasUnsavedChanges = selectProduct !== null && (
        productName.trim() !== selectProduct.productName ||
        Number(manufactureId) !== selectProduct.manufactureId ||
        Number(categoryId) !== selectProduct.categoryId ||
        Number(price) !== selectProduct.price ||
        Number(count) !== selectProduct.count
    );

    // Price validation
    const priceError = (() => {
        if (price.trim() === "") {
            return "Price is required.";
        }

        const value = Number(price);

        if (!Number.isFinite(value) || value <= 0) {
            return "Price must be greater than 0.";
        }

        if (!/^\d+(\.\d{1,2})?$/.test(price)) {
            return "Price can have up to 2 decimal places.";
        }

        return "";
    })();

    // Count validation
    const countError = (() => {
        if (count.trim() === "") {
            return "Count is required.";
        }

        const value = Number(count);

        if (!Number.isInteger(value) || value <= 0) {
            return "Count must be greater than 0.";
        }

        return "";
    })();

    // Empty fields should not display red errors
    const showPriceError =
        price.trim() !== "" && priceError !== "";

    const showCountError =
        count.trim() !== "" && countError !== "";

    const isFormValid = () => {
        return (
            productName.trim() !== "" &&
            manufactureId !== "" &&
            categoryId !== "" &&
            Number.isInteger(Number(manufactureId)) &&
            Number(manufactureId) > 0 &&
            Number.isInteger(Number(categoryId)) &&
            Number(categoryId) > 0 &&
            priceError === "" &&
            countError === ""
        );
    };

    const getProductData = () => ({
        productName: productName.trim(),
        manufactureId: Number(manufactureId),
        categoryId: Number(categoryId),
        price: Number(price),
        count: Number(count)
    });

    const clearForm = () => {
        setProductName("");
        setManufactureId("");
        setCategoryId("");
        setPrice("");
        setCount("");
        setSubmitError("");
    };

    // Add Product
    const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        setSubmitError("");

        if (!isFormValid() || isSubmitting) {
            return;
        }

        setIsSubmitting(true);

        try {
            await onAddProduct(getProductData());

            clearForm();

        } catch (error) {
            setSubmitError(
                error instanceof Error
                    ? error.message
                    : "Failed to add product."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // Save Product
    const handleSave = async () => {
        setSubmitError("");

        if (!selectProduct) {
            setSubmitError("Please select a product first.");
            return;
        }

        if (!isFormValid() || isSubmitting) {
            return;
        }

        setIsSubmitting(true);

        try {
            await onSaveProduct({
                id: selectProduct.id,
                ...getProductData()
            });

        } catch (error) {
            setSubmitError(
                error instanceof Error
                    ? error.message
                    : "Failed to update product."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // Load dropdown data
    useEffect(() => {
        const loadDropdownData = async () => {
            try {
                const [manufactureData, categoryData] =
                    await Promise.all([
                        getManufactures(),
                        getCategories()
                    ]);

                setManufactures(manufactureData);
                setCategories(categoryData);

            } catch (error) {
                console.error(
                    "Failed to load dropdown data",
                    error
                );
            }
        };

        void loadDropdownData();
    }, []);

    // Load selected product
    useEffect(() => {
        setSubmitError("");

        if (selectProduct) {
            setProductName(selectProduct.productName);
            setManufactureId(String(selectProduct.manufactureId));
            setCategoryId(String(selectProduct.categoryId));
            setPrice(String(selectProduct.price));
            setCount(String(selectProduct.count));
        }
    }, [selectProduct]);

    return (
        <div className="product-form-container">
            <form
                className="product-form"
                onSubmit={handleSubmit}
            >
                <h2>Product details</h2>

                <p className="form-subtitle">
                    Manage your product information
                </p>

                {/* Product Name */}
                <div className="input-group">
                    <label htmlFor="productname">
                        Product Name
                    </label>

                    <input
                        id="productname"
                        type="text"
                        placeholder="Enter product name"
                        required
                        value={productName}
                        onChange={(e) => {
                            setProductName(e.target.value);
                            setSubmitError("");
                        }}
                    />
                </div>

                {/* Manufacture */}
                <div className="input-group">
                    <label htmlFor="manufactureId">
                        Manufacturer
                    </label>

                    <select
                        id="manufactureId"
                        required
                        value={manufactureId}
                        onChange={(e) => {
                            setManufactureId(e.target.value);
                            setSubmitError("");
                        }}
                    >
                        <option value="">
                            Select Manufacturer
                        </option>

                        {manufactures.map((manufacture) => (
                            <option
                                key={manufacture.id}
                                value={manufacture.id}
                            >
                                {manufacture.manufactureName}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Category */}
                <div className="input-group">
                    <label htmlFor="categoryId">
                        Category
                    </label>

                    <select
                        id="categoryId"
                        required
                        value={categoryId}
                        onChange={(e) => {
                            setCategoryId(e.target.value);
                            setSubmitError("");
                        }}
                    >
                        <option value="">
                            Select Category
                        </option>

                        {categories.map((category) => (
                            <option
                                key={category.id}
                                value={category.id}
                            >
                                {category.categoryName}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Price and Count */}
                <div className="form-row">

                    <div className="input-group">
                        <label htmlFor="price">
                            Price
                        </label>

                        <input
                            id="price"
                            type="number"
                            step="0.01"
                            min="0"
                            required
                            value={price}
                            placeholder="Enter price"
                            onChange={(e) => {
                                setPrice(e.target.value);
                                setSubmitError("");
                            }}
                            aria-invalid={showPriceError}
                            className={
                                showPriceError ? "input-error" : ""
                            }
                        />

                        {showPriceError && (
                            <p
                                id="price-error"
                                className="validation-error"
                                role="alert"
                            >
                                <span>!</span>
                                {priceError}
                            </p>
                        )}
                    </div>

                    <div className="input-group">
                        <label htmlFor="count">
                            Count
                        </label>

                        <input
                            id="count"
                            type="number"
                            step="1"
                            min="0"
                            required
                            value={count}
                            placeholder="Enter quantity"
                            onChange={(e) => {
                                setCount(e.target.value);
                                setSubmitError("");
                            }}
                            aria-invalid={showCountError}
                            className={
                                showCountError ? "input-error" : ""
                            }
                        />

                        {showCountError && (
                            <p
                                id="count-error"
                                className="validation-error"
                                role="alert"
                            >
                                <span>!</span>
                                {countError}
                            </p>
                        )}
                    </div>

                </div>
                {submitError && (
                    <div className="submit-error" role="alert">
                        <div className="submit-error-icon">
                            !
                        </div>

                        <div className="submit-error-content">
                            <span className="submit-error-title">
                                Unable to save product
                            </span>

                            <span className="submit-error-message">
                                {submitError}
                            </span>
                        </div>
                    </div>
                )}
                {/* Actions */}
                <div className="form-actions">



                    <button
                        type="submit"
                        className={`Add-btn${hasUnsavedChanges ? " Add-btn--muted" : ""}`}
                        disabled={isSubmitting}
                    >
                        Add
                    </button>

                    <button
                        type="button"
                        className={`Save-btn${hasUnsavedChanges ? " Save-btn--pending" : ""}`}
                        onClick={handleSave}
                        disabled={isSubmitting}
                    >
                        Save
                    </button>

                </div>
            </form>
        </div>
    );
}
