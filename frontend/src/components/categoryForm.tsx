
import "../styles/productForm.css";

export default function CategoryForm() {
    return (
        <div className="product-form-container">
            <form className="product-form">
                <h2>Category Management</h2>
                <p className="form-subtitle">
                    Manage your category information
                </p>

                <div className="input-group">
                    <label htmlFor="productname">Category Name</label>
                    <input
                        id="productname"
                        type="text"
                        placeholder="Enter product name"
                        required
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="manufacturename">Detail</label>
                    <input
                        id="manufacturename"
                        type="text"
                        placeholder="Enter manufacturer name"
                        required
                    />
                </div>




                <div className="form-actions">
                    <button type="button" className="Add-btn">
                        Add
                    </button>


                    <button type="submit" className="Save-btn">
                        Save
                    </button>

                    <button type="button" className="Delete-btn">
                        Delete
                    </button>
                </div>
            </form>
        </div>
    );
}
