import RecordActions from "./RecordActions";

import "../styles/productMenu.css";
import type { Product } from "../types/types";

interface ProductMenuProps {
    products: Product[];
    onSelectProduct: (product: Product) => void;
    onDeleteProduct: (id: number) => Promise<void>;
    search: string;
}

export default function ProductMenu({
    products,
    onSelectProduct,
    onDeleteProduct,
    search
}: ProductMenuProps) {

    // Filter products by search keyword
    const filteredProducts = products.filter((product) => {
        const keyword = search.trim().toLowerCase();

        return (
            product.productName
                .toLowerCase()
                .includes(keyword) ||

            (product.manufactureName ?? "")
                .toLowerCase()
                .includes(keyword) ||

            (product.categoryName ?? "")
                .toLowerCase()
                .includes(keyword)
        );
    });

    return (
        <div className="product-menu-container">
            <div className="product-menu">
                <div className="product-menu-header">
                    <h2>Product inventory</h2>
                    <p>View and manage your product inventory</p>
                </div>

                <div className="product-table-wrapper">
                    <table className="product-table">
                        <thead>
                            <tr>
                                <th>No.</th>
                                <th>Product Name</th>
                                <th>Manufacturer</th>
                                <th>Category</th>
                                <th>Total Stock</th>
                                <th>Unit Price</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredProducts.map((product, index) => (
                                <tr key={product.id}>
                                    <td>{index + 1}</td>
                                    <td>{product.productName}</td>
                                    <td>{product.manufactureName ?? "Unknown"}</td>
                                    <td>{product.categoryName ?? "Unknown"}</td>
                                    <td>{product.count}</td>
                                    <td>£{product.price.toFixed(2)}</td>
                                    <td>
                                        <RecordActions name={product.productName} onUpdate={() => onSelectProduct(product)} onDelete={() => onDeleteProduct(product.id)} />
                                    </td>
                                </tr>
                            ))}

                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        style={{
                                            textAlign: "center",
                                            padding: "20px"
                                        }}
                                    >
                                        No products found.
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
