import type { Product, Category, Manufacture } from '../types/types'
import "../styles/productForm.css";
import { useState, useEffect } from 'react'
import type { SubmitEventHandler } from 'react'
import { getManufactures } from "../api/manufactureApi";
import { getCategories } from "../api/categoryApi";

interface ProductFormProps {
    onAddProduct: (product: Omit<Product, "id">) => Promise<void>
    selectProduct: Product | null
    onSaveProduct: (product: Product) => Promise<void>
    onDeleteProduct: (id: number) => Promise<void>
}

export default function ProductForm({ onAddProduct, selectProduct, onSaveProduct, onDeleteProduct }: ProductFormProps) {


    const [productName, setProductName] = useState("");
    const [manufactureId, setManufactureId] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [manufactures, setManufactures] = useState<Manufacture[]>([]);
    const [categories, setCategories] = useState<Category[]>([])
    const [price, setPrice] = useState("");
    const [count, setCount] = useState("");
    const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();

        if (
            !productName.trim() ||
            !manufactureId ||
            !categoryId ||
            price === "" ||
            count === "" ||
            !Number.isInteger(Number(manufactureId)) ||
            Number(manufactureId) <= 0 ||
            !Number.isInteger(Number(categoryId)) ||
            Number(categoryId) <= 0 ||
            Number(price) < 0 ||
            !Number.isInteger(Number(count)) ||
            Number(count) < 0
        ) {
            alert("Please enter valid product information");
            return;
        }

        try {
            await onAddProduct({
                productName: productName.trim(),
                manufactureId: Number(manufactureId),
                categoryId: Number(categoryId),
                price: Number(price),
                count: Number(count)
            });

            setProductName("");
            setManufactureId("");
            setCategoryId("");
            setPrice("");
            setCount("");
        } catch (error) {
            console.error(error);
        }
    };

    const handleSave = async () => {
        if (!selectProduct) {
            alert("Please select a product first!")
            return
        }
        if (!productName.trim() ||
            !manufactureId.trim() ||
            !categoryId.trim() ||
            price === "" ||
            count === "" ||
            Number(price) < 0 ||
            !Number.isInteger(Number(count)) ||
            Number(count) < 0
        ) {
            alert('Please enter valid product information')
            return
        }
        try {

            await onSaveProduct({
                id: selectProduct.id,
                productName,
                manufactureId: Number(manufactureId),
                categoryId: Number(categoryId),
                price: Number(price),
                count: Number(count)
            })

        } catch (error) { console.log(error) }

    }
    const handleDelete = async () => {
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
        try {

            await onDeleteProduct(selectProduct.id)
            setProductName("");
            setManufactureId("");
            setCategoryId("");
            setPrice("");
            setCount("");
        } catch (error) { console.log(error) }





    }

    useEffect(() => {
        const loadDropdownData = async () => {
            try {
                const [manufactureData, categoryData] = await Promise.all([
                    getManufactures(),
                    getCategories()
                ]);
                setManufactures(manufactureData);
                setCategories(categoryData)
            } catch (error) {
                console.error("Failed to load dropdown data", error)
            }
        }
        void loadDropdownData()
    }, [])

    useEffect(() => {
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
                    <label htmlFor="manufactureId">Manufacture Name</label>

                    <select
                        id="manufactureId"
                        required
                        value={manufactureId}
                        onChange={(e) => setManufactureId(e.target.value)}
                    >
                        <option value="">Select Manufacturer</option>

                        {manufactures.map(manufacture => (
                            <option
                                key={manufacture.id}
                                value={manufacture.id}
                            >
                                {manufacture.manufactureName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="input-group">
                    <label htmlFor="categoryId">Category</label>

                    <select
                        id="categoryId"
                        required
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                    >
                        <option value="">Select Category</option>

                        {categories.map(category => (
                            <option
                                key={category.id}
                                value={category.id}
                            >
                                {category.categoryName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-row">
                    <div className="input-group">
                        <label htmlFor="price">Price</label>
                        <input
                            id="price"
                            type="number"
                            step="0.01"
                            min="0"

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
