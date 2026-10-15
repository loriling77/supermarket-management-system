
import NavBar from "../components/navBar";
import CategoryForm from "../components/categoryForm";
import CategoryMenu from "../components/categoryMenu";
import { useState } from 'react'
import type { Category } from '../types/types'

import "../styles/home.css";

export default function Category() {

    const [categories, setCategories] = useState<Category[]>([])
    const [selectCategory, setSelectCategory] = useState<Category | null>(null)

    const handleAddCategory = (newCategory: Omit<Category, 'id'>) => {
        setCategories(prevCategories => [
            ...prevCategories,
            {
                ...newCategory,
                id: prevCategories.length > 0
                    ? Math.max(...prevCategories.map(p => p.id)) + 1
                    : 1
            }
        ]

        )



    }

    const handleSaveCategory = (updatedCategory: Category) => {
        setCategories(prevCategories =>
            prevCategories.map(category =>
                category.id === updatedCategory.id ?
                    updatedCategory :
                    category
            )
        )
    }

    const handleDeleteCategory = (id: number) => {
        setCategories(prevCategories =>
            prevCategories.filter(category => category.id !== id)
        );

        setSelectCategory(null);
    }

    return (
        <div className="home-container">
            <aside className="home-sidebar">
                <NavBar />
            </aside>

            <main className="home-main">
                <div className="home-header">
                    <h1>Dashboard</h1>
                    <p>Manage your Manufactures</p>
                </div>

                <div className="home-content">
                    <section className="home-form-section">
                        <CategoryForm onAddCategory={handleAddCategory} selectCategory={selectCategory} onSaveCategory={handleSaveCategory} onDeleteCategory={handleDeleteCategory} />
                    </section>

                    <section className="home-table-section">
                        <CategoryMenu categories={categories} onSelectCategory={setSelectCategory} />
                    </section>
                </div>
            </main>
        </div>
    );
}
