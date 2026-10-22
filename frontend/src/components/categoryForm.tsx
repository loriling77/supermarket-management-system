
import "../styles/productForm.css";
import type { Category } from '../types/types'
import type { SubmitEventHandler } from 'react'
import { useState, useEffect } from 'react'

interface CategoryFormProps {
    onAddCategory: (category: Omit<Category, 'id'>) => Promise<void>
    selectCategory: Category | null
    onSaveCategory: (category: Category) => Promise<void>
}

export default function CategoryForm({ onAddCategory, selectCategory, onSaveCategory }: CategoryFormProps) {

    const [categoryName, setCategoryName] = useState("")
    const [detail, setDetail] = useState("")

    const hasUnsavedChanges = selectCategory !== null && (
        categoryName !== selectCategory.categoryName || detail !== selectCategory.detail
    );


    const handleSubmit: SubmitEventHandler<HTMLElement> = async (e) => {
        e.preventDefault()

        try {
            await onAddCategory(
                {
                    categoryName,
                    detail

                }
            )
            setCategoryName("")
            setDetail("")

        } catch (error
        ) {
            console.error(error)
        }




    }
    const handleSave = async () => {
        if (!selectCategory) {
            alert("Please select a category first!")
            return
        }
        if (!categoryName.trim()


        ) {
            alert('Please enter valid category information')
            return
        }

        try {

            await onSaveCategory({
                id: selectCategory.id,
                categoryName,
                detail
            })
        } catch (error) { console.error(error) }




    }

    useEffect(() => {
        if (selectCategory) {
            setCategoryName(selectCategory.categoryName);
            setDetail(selectCategory.detail);
        }
    }, [selectCategory]);

    return (
        <div className="product-form-container">
            <form className="product-form" onSubmit={handleSubmit}>
                <h2>Category details</h2>
                <p className="form-subtitle">
                    Manage your category information
                </p>

                <div className="input-group">
                    <label htmlFor="productname">Category Name</label>
                    <input
                        id="productname"
                        type="text"
                        placeholder="Enter category name"
                        value={categoryName}

                        required
                        onChange={(e) => setCategoryName(e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="manufacturename">Detail</label>
                    <input
                        id="manufacturename"
                        type="text"
                        value={detail}


                        onChange={(e) => setDetail(e.target.value)}
                    />
                </div>




                <div className="form-actions">
                    <button type="submit" className={`Add-btn${hasUnsavedChanges ? " Add-btn--muted" : ""}`}>
                        Add
                    </button>


                    <button type="button" className={`Save-btn${hasUnsavedChanges ? " Save-btn--pending" : ""}`} onClick={handleSave}>
                        Save
                    </button>
                </div>
            </form>
        </div>
    );
}
