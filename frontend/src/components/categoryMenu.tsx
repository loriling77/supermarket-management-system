import RecordActions from "./RecordActions";
import type { Category } from '../types/types'
import "../styles/productMenu.css";

interface CategoryMenuProps {
    categories: Category[]
    onSelectCategory: (category: Category) => void
    onDeleteCategory: (id: number) => Promise<void>;
    search: string
}

export default function CategoryMenu({ categories, onSelectCategory, onDeleteCategory, search }: CategoryMenuProps) {
    const filteredCategories = categories.filter(
        category => category.categoryName
            .toLowerCase()
            .includes(search.trim().toLowerCase()))

    return (
        <div className="product-menu-container">
            <div className="product-menu">
                <div className="product-menu-header">
                    <h2>Category list</h2>
                    <p>View and manage your categories</p>
                </div>

                <div className="product-table-wrapper">
                    <table className="product-table">
                        <thead>
                            <tr>
                                <th>No.</th>
                                {/* <th>ID</th> */}
                                <th>Category Name</th>
                                <th>Detail</th>

                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredCategories.map((category, index) => (
                                <tr key={category.id}>
                                    <td>{index + 1}</td>
                                    {/* <td>{category.id}</td> */}
                                    <td>{category.categoryName}</td>
                                    <td>{category.detail}</td>
                                    <td><RecordActions name={category.categoryName} onUpdate={() => onSelectCategory(category)} onDelete={() => onDeleteCategory(category.id)} /></td>

                                </tr>


                            ))}
                            {filteredCategories.length === 0 && (
                                <tr>
                                    <td colSpan={4}>
                                        No categories found
                                    </td>
                                </tr>
                            )}







                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
