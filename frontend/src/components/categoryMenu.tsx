import type { Category } from '../types/types'
import "../styles/productMenu.css";

interface CategoryMenuProps {
    categories: Category[]
    onSelectCategory: (category: Category) => void
    search: string
}

export default function CategoryMenu({ categories, onSelectCategory, search }: CategoryMenuProps) {
    const filteredCategories = categories.filter(
        category => category.categoryName
            .toLowerCase()
            .includes(search.trim().toLowerCase()))

    return (
        <div className="product-menu-container">
            <div className="product-menu">
                <div className="product-menu-header">
                    <h1>Category Management</h1>
                    <p>View and manage your categories</p>
                </div>

                <div className="product-table-wrapper">
                    <table className="product-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Category Name</th>
                                <th>Detail</th>

                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredCategories.map(category => (
                                <tr key={category.id}>
                                    <td>{category.id}</td>
                                    <td>{category.categoryName}</td>
                                    <td>{category.detail}</td>
                                    <td><button onClick={() => onSelectCategory(category)}>select</button></td>

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
