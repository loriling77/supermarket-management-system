
import "../styles/searchProduct.css";
import { useState } from 'react';
import { useLocation } from 'react-router-dom';


interface SearchProps {
    onSearch: (test: string) => void;
}

export default function SearchProduct({ onSearch }: SearchProps) {
    const location = useLocation()
    const pageName =
        location.pathname === "/home" ? "Products" :
            location.pathname === "/user" ? "Users" :
                location.pathname === "/category" ? "Categories" :
                    location.pathname === "/manufacture" ? "Manufactures" :
                        "Products";


    const [input, setInput] = useState<string>("");
    const handleSearch = () => {

        onSearch(input.trim())
    }
    return (
        <div className="search-product">
            <h2>Search {pageName}</h2>

            <div className="search-bar">
                <div className="search-input-wrapper">
                    <span className="search-icon">⌕</span>

                    <input
                        type="text"

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
