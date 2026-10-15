
import "../styles/productMenu.css";
import type { Manufacture } from '../types/types'

interface ManufactureMenuProps {
    manufactures: Manufacture[];
    onSelectManufacture: (manufacture: Manufacture) => void
}

export default function ManufactureMenu({ manufactures, onSelectManufacture }: ManufactureMenuProps) {


    return (
        <div className="product-menu-container">
            <div className="product-menu">
                <div className="product-menu-header">
                    <h1>Manufacture Management</h1>
                    <p>View and manage your product inventory</p>
                </div>

                <div className="product-table-wrapper">
                    <table className="product-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Manufacture Name</th>
                                <th>Product Liscence Number</th>
                                <th>Place of Origin</th>

                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {manufactures.map((manufacture) => (
                                <tr key={manufacture.id}>
                                    <td>{manufacture.id}</td>
                                    <td>{manufacture.manufactureName}</td>
                                    <td>{manufacture.productionLiscenseNumber}</td>
                                    <td>{manufacture.placeOfOrigin}</td>
                                    <td>
                                        <button
                                            type="button"
                                            className="select-btn"
                                            onClick={() => onSelectManufacture(manufacture)}
                                        >select</button>
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
