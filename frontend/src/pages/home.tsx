
import NavBar from "../components/navBar";
import ProductForm from "../components/productForm";
import ProductMenu from "../components/productMenu";
import Search from "../components/search";

import { useState, useEffect } from "react";

import type { Product } from "../types/types";

import {
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct
} from "../api/productApi";

import { getCurrentUser } from "../api/authApi";

import "../styles/home.css";

export default function Home() {
    const [products, setProducts] = useState<Product[]>([]);
    const [error, setError] = useState("");
    const [selectProduct, setSelectProduct] =
        useState<Product | null>(null);
    const [search, setSearch] = useState("");

    // Load all products from API
    const loadProducts = async () => {
        const data = await getProducts();
        setProducts(data);
    };

    // Check authentication
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const user = await getCurrentUser();
                console.log("Current user:", user);
            } catch (error) {
                console.error("Auth check failed:", error);
            }
        };

        void checkAuth();
    }, []);

    // Load products when page opens
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setError("");
                await loadProducts();
            } catch (error) {
                console.error(error);
                setError("Failed to load products.");
            }
        };

        void fetchProducts();
    }, []);

    // Add Product
    const handleAddProduct = async (
        product: Omit<Product, "id">
    ): Promise<void> => {
        try {
            setError("");

            await addProduct(product);

            // Reload products to get manufacture/category names
            await loadProducts();

        } catch (error) {
            console.error("Add product failed:", error);

            // Pass error to ProductForm
            throw error;
        }
    };

    // Save Product
    const handleSaveProduct = async (
        updatedProduct: Product
    ): Promise<void> => {
        try {
            setError("");

            await updateProduct(updatedProduct);

            // Reload products to get updated names
            await loadProducts();

            setSelectProduct(null);

        } catch (error) {
            console.error("Save product failed:", error);

            // Pass 409 error to ProductForm
            throw error;
        }
    };

    // Delete Product
    const handleDeleteProduct = async (
        id: number
    ): Promise<void> => {
        try {
            setError("");

            await deleteProduct(id);

            setProducts((prevProducts) =>
                prevProducts.filter(
                    (product) => product.id !== id
                )
            );

            setSelectProduct(null);

        } catch (error) {
            console.error("Delete product failed:", error);

            // Pass error to ProductForm
            throw error;
        }
    };

    return (
        <div className="home-container">
            <aside className="home-sidebar">
                <NavBar />
            </aside>

            <main className="home-main">
                <div className="home-header">
                    <h1>Dashboard</h1>
                    <p>Manage your products and inventory</p>
                </div>

                {error && (
                    <p role="alert" style={{ color: "red" }}>
                        {error}
                    </p>
                )}

                <div className="home-content">
                    <section className="home-form-section">
                        <ProductForm
                            onAddProduct={handleAddProduct}
                            onDeleteProduct={handleDeleteProduct}
                            selectProduct={selectProduct}
                            onSaveProduct={handleSaveProduct}
                        />
                    </section>

                    <section className="home-table-section">
                        <Search onSearch={setSearch} />

                        <ProductMenu
                            products={products}
                            onSelectProduct={setSelectProduct}
                            search={search}
                        />
                    </section>
                </div>
            </main>
        </div>
    );
}
