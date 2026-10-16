
import "../styles/searchProduct.css";
import { useState } from 'react';


interface SearchProps {
    onSearch: (test: string) => void;
}

export default function SearchProduct({ onSearch }: SearchProps) {
    const [input, setInput] = useState<string>("");
    const handleSearch = () => {

        onSearch(input.trim())
    }
    return (
        <div className="search-product">
            <h2>Search Products</h2>

            <div className="search-bar">
                <div className="search-input-wrapper">
                    <span className="search-icon">⌕</span>

                    <input
                        type="text"
                        placeholder="Search by product name..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                </div>

                <button type="button" className="search-btn" onClick={handleSearch}>
                    Search
                </button>
            </div>
        </div>
    );
}
