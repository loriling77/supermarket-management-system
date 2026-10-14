
import "../styles/productForm.css";

export default function ManufactureForm() {
    return (
        <div className="product-form-container">
            <form className="product-form">
                <h2>Manufacture Management</h2>
                <p className="form-subtitle">
                    Manage your manufacture information
                </p>

                <div className="input-group">
                    <label htmlFor="productname">Manufacture Name</label>
                    <input
                        id="productname"
                        type="text"
                        placeholder="Enter product name"
                        required
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="manufacturename">Production License Number</label>
                    <input
                        id="manufacturename"
                        type="text"
                        placeholder="Enter manufacturer name"
                        required
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="category">Place of Origin</label>
                    <input
                        id="category"
                        type="text"
                        placeholder="Enter category"
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
