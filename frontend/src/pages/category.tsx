
import NavBar from "../components/navBar";
import CategoryForm from "../components/categoryForm";
import CategoryMenu from "../components/categoryMenu";
import Search from "../components/search";
import { useState } from 'react'
import type { Category } from '../types/types'
import {
    getCategories,
    addCategory,
    updateCategory,
    deleteCategory
} from "../api/categoryApi";

import "../styles/home.css";
import { useEffect } from 'react'
export default function Category() {

    const [categories, setCategories] = useState<Category[]>([])
    const [selectCategory, setSelectCategory] = useState<Category | null>(null)
    const [error, setError] = useState("");
    const [search, setSearch] = useState<string>("")
    useEffect(() => {
        const loadCategories = async () => {
            try {
                setError("")
                const data = await getCategories()
                setCategories(data)
            } catch (err) {
                console.log(err)
                setError("Failed to load categories")
            }

        }
        loadCategories()
    }, [])



    const handleAddCategory = async (newCategory: Omit<Category, 'id'>) => {
        try {
            setError("")
            const createdCategory = await addCategory(newCategory)
            setCategories(prev => [...prev, createdCategory])

        } catch (err) {
            console.log(err)
            setError("failed to add a category")
        }

    }

    const handleSaveCategory = async (updatedCategory: Category) => {

        try {
            setError('')
            await updateCategory(updatedCategory)

            setCategories(prevCategories =>
                prevCategories.map(category =>
                    category.id === updatedCategory.id ?
                        updatedCategory :
                        category
                )
            )
        } catch (err) {
            console.log(err)
            setError("Failed to update category")
        }

    }

    const handleDeleteCategory = async (id: number) => {

        try {
            setError("")
            await deleteCategory(id)

            setCategories(prevCategories =>
                prevCategories.filter(category => category.id !== id)
            );

            setSelectCategory(null);
        } catch (err) {
            console.log(err)
            setError("Failed to delete category")
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
                    <p>Manage your Categories</p>
                </div>
                {error && (
                    <p role="alert" style={{ color: "red" }}>
                        {error}
                    </p>
                )}

                <div className="home-content">
                    <section className="home-form-section">
                        <CategoryForm onAddCategory={handleAddCategory} selectCategory={selectCategory} onSaveCategory={handleSaveCategory} onDeleteCategory={handleDeleteCategory} />
                    </section>

                    <section className="home-table-section">
                        <Search onSearch={setSearch}></Search>
                        <CategoryMenu search={search} categories={categories} onSelectCategory={setSelectCategory} />
                    </section>
                </div>
            </main>
        </div>
    );
}
