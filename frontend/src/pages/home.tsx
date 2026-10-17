
import NavBar from "../components/navBar";
import ProductForm from "../components/productForm";
import ProductMenu from "../components/productMenu";
import Search from "../components/search";
import { useState, useEffect } from 'react'
import type { Product } from '../types/types'
import {
    getProducts,
    getProduct,
    addProduct,
    updateProduct,
    deleteProduct
} from '../api/productApi'

import "../styles/home.css";

export default function Home() {
    const [products, setProducts] = useState<Product[]>([])
    const [error, setError] = useState("")
    const [selectProduct, setSelectProduct] = useState<Product | null>(null)
    const [search, setSearch] = useState<string>("")
    useEffect(() => {
        const loadProducts = async () => {
            try {
                setError("")
                const data = await getProducts()
                setProducts(data)
            } catch (error) {
                console.log(error),
                    setError("Failed to load Products")
            }
            loadProducts()
        }
    }, [])
    const handleAddProduct = async (newProduct: Omit<Product, "id">) => {

        try {
            setError("")
            const createdProduct = await addProduct(newProduct)
            setProducts(prev => [...prev, createdProduct])
        } catch (err) {
            console.log(err)
            setError("failed to add product")
        }

    }






    const handleDeleteProduct = async (id: number) => {

        try {
            setError("")
            await deleteProduct(id)

            setProducts(prevProducts =>
                prevProducts.filter(product => product.id !== id)
            );
            setSelectProduct(null)
        } catch (err) {
            console.log(err)
            setError("Failed to delete product")
        }



    }

    const handleSaveProduct = async (updatedProduct: Product) => {
        try {
            setError("")
            await updateProduct(updatedProduct)

            setProducts(prevProducts =>
                prevProducts.map(product =>
                    product.id === updatedProduct.id ?
                        updatedProduct :
                        product
                ))
        } catch (err) {
            console.log(err)
            setError("Failed to save product")
        }

    }




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
                        <ProductForm onAddProduct={handleAddProduct} onDeleteProduct={handleDeleteProduct} selectProduct={selectProduct} onSaveProduct={handleSaveProduct} />
                    </section>

                    <section className="home-table-section">
                        <Search onSearch={setSearch}></Search>
                        <ProductMenu products={products} onSelectProduct={setSelectProduct} search={search} />
                    </section>
                </div>
            </main>
        </div>
    );
}
