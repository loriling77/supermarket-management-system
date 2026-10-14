
import NavBar from "../components/navBar";
import ProductForm from "../components/productForm";
import ProductMenu from "../components/productMenu";
import { useState } from 'react'
import type { Product } from '../types/types'

import "../styles/home.css";

export default function Home() {
    const [products, setProducts] = useState<Product[]>([])
    const [selectProduct, setSelectProduct] = useState<Product | null>(null)
    const handleAddProduct = (newProduct: Omit<Product, "id">) => {
        setProducts(prevProducts => [
            ...prevProducts,
            {
                ...newProduct,
                id: prevProducts.length > 0
                    ? Math.max(...prevProducts.map(p => p.id)) + 1
                    : 1
            }
        ])
    }






    const handleDeleteProduct = (id: number) => {
        setProducts(prevProducts =>
            prevProducts.filter(product => product.id !== id)
        );

        setSelectProduct(null);
    }

    const handleSaveProduct = (updatedProduct: Product) => {

        setProducts(prevProducts =>
            prevProducts.map(product =>
                product.id === updatedProduct.id ?
                    updatedProduct :
                    product
            ))
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

                <div className="home-content">
                    <section className="home-form-section">
                        <ProductForm onAddProduct={handleAddProduct} onDeleteProduct={handleDeleteProduct} selectProduct={selectProduct} onSaveProduct={handleSaveProduct} />
                    </section>

                    <section className="home-table-section">
                        <ProductMenu products={products} onSelectProduct={setSelectProduct} />
                    </section>
                </div>
            </main>
        </div>
    );
}
