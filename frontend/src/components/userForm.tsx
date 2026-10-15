
import "../styles/productForm.css";

export default function ProductForm() {
    return (
        <div className="product-form-container">
            <form className="product-form">
                <h2>User Management</h2>
                <p className="form-subtitle">
                    Manage your user information
                </p>

                <div className="input-group">
                    <label htmlFor="productname">Username</label>
                    <input
                        id="productname"
                        type="text"

                        required
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="manufacturename">Email</label>
                    <input
                        id="manufacturename"
                        type="text"

                        required
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="category">Telephone</label>
                    <input
                        id="category"
                        type="text"

                        required
                    />
                </div>

                <div className="form-row">
                    <div className="input-group">
                        <label htmlFor="price">Password</label>
                        <input
                            id="price"
                            type="text"


                            required
                        />
                    </div>


                </div>

                <div className="form-actions">



                    <button type="button" className="Delete-btn">
                        Delete
                    </button>
                </div>
            </form>
        </div>
    );
}
