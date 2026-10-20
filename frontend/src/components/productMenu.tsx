
import "../styles/productMenu.css";
import type { Product } from '../types/types'

interface ProductMenuProps {
    products: Product[];
    onSelectProduct: (product: Product) => void;
    search: string
}

export default function ProductMenu({ products, onSelectProduct }: ProductMenuProps

) {
    return (
        <div className="product-menu-container">
            <div className="product-menu">
                <div className="product-menu-header">
                    <h1>Product Management</h1>
                    <p>View and manage your product inventory</p>
                </div>

                <div className="product-table-wrapper">
                    <table className="product-table">
                        <thead>
                            <tr>
                                <th>No.</th>
                                {/* <th>ID</th> */}
                                <th>Product Name</th>
                                <th>Manufacture</th>
                                <th>Category</th>
                                <th>Total Stock</th>
                                <th>Unit Price</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {products.map((product, index) => (
                                <tr key={product.id}>
                                    <td>{index + 1}</td>
                                    {/* <td>{product.id}</td> */}
                                    <td>{product.productName}</td>
                                    <td>{product.manufactureName ?? "Unknown"}</td>
                                    <td>{product.categoryName ?? "Unknown"}</td>
                                    <td>{product.count}</td>
                                    <td>{product.price}</td>
                                    <td>
                                        <button
                                            type="button"
                                            className="select-btn"
                                            onClick={() => onSelectProduct(product)}>select</button>
                                    </td>
                                </tr>
                            ))}







                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
