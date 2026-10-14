
import "../styles/searchProduct.css";

export default function SearchProduct() {
    return (
        <div className="search-product">
            <h2>Search Products</h2>

            <div className="search-bar">
                <div className="search-input-wrapper">
                    <span className="search-icon">⌕</span>

                    <input
                        type="text"
                        placeholder="Search by product name..."
                    />
                </div>

                <button type="button" className="search-btn">
                    Search
                </button>
            </div>
        </div>
    );
}
