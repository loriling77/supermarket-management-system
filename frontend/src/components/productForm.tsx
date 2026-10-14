import type { Product } from '../types/types'
import "../styles/productForm.css";
import { useState, useEffect } from 'react'
import type { SubmitEventHandler } from 'react'

interface ProductFormProps {
    onAddProduct: (product: Omit<Product, "id">) => void
    selectProduct: Product | null
    onSaveProduct: (product: Product) => void
    onDeleteProduct: (id: number) => void
}

export default function ProductForm({ onAddProduct, selectProduct, onSaveProduct, onDeleteProduct }: ProductFormProps) {


    const [productName, setProductName] = useState("");
    const [manufactureName, setManufactureName] = useState("");
    const [category, setCategory] = useState("");
    const [price, setPrice] = useState("");
    const [count, setCount] = useState("");
    const handleSubmit: SubmitEventHandler<HTMLElement> = (e) => {
        e.preventDefault()


        onAddProduct({
            productName,
            manufactureName,
            category,
            price: Number(price),
            count: Number(count)

        })

        setProductName("");
        setManufactureName("");
        setCategory("");
        setPrice("");
        setCount("");
    }

    const handleSave = () => {
        if (!selectProduct) {
            alert("Please select a product first!")
            return
        }
        if (!productName.trim() ||
            !manufactureName.trim() ||
            !category.trim() ||
            price === "" ||
            count === "" ||
            Number(price) < 0 ||
            !Number.isInteger(Number(count)) ||
            Number(count) < 0
        ) {
            alert('Please enter valid product information')
            return
        }

        onSaveProduct({
            id: selectProduct.id,
            productName,
            manufactureName: manufactureName,
            category,
            price: Number(price),
            count: Number(count)
        })

    }
    const handleDelete = () => {
        if (!selectProduct) {
            alert("Please select a product first!");
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to delete this product?"
        );

        if (!confirmed) {
            return;
        }

        onDeleteProduct(selectProduct.id);

        setProductName("");
        setManufactureName("");
        setCategory("");
        setPrice("");
        setCount("");

    }

    useEffect(() => {
        if (selectProduct) {
            setProductName(selectProduct.productName);
            setManufactureName(selectProduct.manufactureName);
            setCategory(selectProduct.category);
            setPrice(String(selectProduct.price));
            setCount(String(selectProduct.count));
        }
    }, [selectProduct]);


    return (
        <div className="product-form-container">
            <form className="product-form" onSubmit={handleSubmit}>
                <h2>Product Management</h2>
                <p className="form-subtitle">
                    Manage your product information
                </p>

                <div className="input-group">
                    <label htmlFor="productname">Product Name</label>
                    <input
                        id="productname"
                        type="text"
                        placeholder="Enter product name"
                        required
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}

                    />
                </div>

                <div className="input-group">
                    <label htmlFor="manufacturename">Manufacture Name</label>
                    <input
                        id="manufacturename"
                        type="text"
                        placeholder="Enter manufacturer name"
                        required
                        value={manufactureName}
                        onChange={(e) => setManufactureName(e.target.value)}

                    />
                </div>

                <div className="input-group">
                    <label htmlFor="category">Category</label>
                    <input
                        id="category"
                        type="text"
                        placeholder="Enter category"
                        required
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}

                    />
                </div>

                <div className="form-row">
                    <div className="input-group">
                        <label htmlFor="price">Price</label>
                        <input
                            id="price"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            required
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}

                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="count">Count</label>
                        <input
                            id="count"
                            type="number"
                            step="1"
                            min="0"
                            placeholder="0"
                            required
                            value={count}
                            onChange={(e) => setCount(e.target.value)}

                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="Add-btn" >
                        Add
                    </button>


                    <button type="button" className="Save-btn" onClick={handleSave} >
                        Save
                    </button>

                    <button type="button" className="Delete-btn" onClick={handleDelete}>
                        Delete
                    </button >
                </div>
            </form>
        </div>
    );
}
