
import "../styles/productForm.css";
import { ShoppingCart } from "lucide-react";

export default function UserOrderForm() {
    return (
        <div className="product-form-container">
            <form className="product-form">



                <div className="input-group">
                    <label htmlFor="productname">Product Name</label>
                    <input
                        id="productname"
                        type="text"

                        required
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="manufacturename">Price</label>
                    <input
                        id="manufacturename"
                        type="number"

                        required
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="category">Count</label>
                    <input
                        id="category"
                        type="number"

                        required
                    />
                </div>



                <div className="form-actions-add-to-cart">

                    <button type="button" className="add-to-cart-btn">
                        <ShoppingCart size={18} />
                        Add to your Cart
                    </button>


                </div>
            </form>
        </div>
    );
}
