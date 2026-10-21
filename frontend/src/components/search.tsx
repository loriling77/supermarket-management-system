
import "../styles/searchProduct.css";
import { useState } from "react";
import { useLocation } from "react-router-dom";

interface SearchProps {
    onSearch: (value: string) => void;
}

export default function SearchProduct({ onSearch }: SearchProps) {
    const location = useLocation();

    const pageName =
        location.pathname === "/home" ? "Products" :
            location.pathname === "/user" ? "Customers" :
                location.pathname === "/category" ? "Categories" :
                    location.pathname === "/manufacture" ? "Manufacturers" :
                        "Products";

    const [input, setInput] = useState("");

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = e.target.value;

        setInput(value);
        onSearch(value.trim());
    };

    const handleSearch = () => {
        onSearch(input.trim());
    };

    return (
        <div className="search-product">
            <h2>Search {pageName}</h2>

            <div className="search-bar">
                <div className="search-input-wrapper">
                    <span className="search-icon">⌕</span>

                    <input
                        type="text"
                        aria-label={`Search ${pageName.toLowerCase()}`}
                        value={input}
                        onChange={handleInputChange}
                        placeholder={`Search ${pageName.toLowerCase()}...`}
                    />
                </div>

                <button
                    type="button"
                    className="search-btn"
                    onClick={handleSearch}
                >
                    Search
                </button>
            </div>
        </div>
    );
}
