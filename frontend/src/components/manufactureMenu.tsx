import RecordActions from "./RecordActions";

import "../styles/productMenu.css";
import type { Manufacture } from '../types/types'

interface ManufactureMenuProps {
    manufactures: Manufacture[];
    onSelectManufacture: (manufacture: Manufacture) => void
    onDeleteManufacture: (id: number) => Promise<void>;
    search: string
}

export default function ManufactureMenu({ manufactures, onSelectManufacture, onDeleteManufacture, search }: ManufactureMenuProps) {

    const filteredManufactures = manufactures.filter(manufacture => manufacture.manufactureName.toLowerCase().includes(search.trim().toLowerCase())
    )
    return (
        <div className="product-menu-container">
            <div className="product-menu">
                <div className="product-menu-header">
                    <h2>Manufacturer directory</h2>
                    <p>Supplier information and product origins</p>
                </div>

                <div className="product-table-wrapper">
                    <table className="product-table">
                        <thead>
                            <tr>
                                <th>No.</th>
                                {/* <th>ID</th> */}
                                <th>Manufacturer</th>
                                <th>Licence number</th>
                                <th>Place of Origin</th>

                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredManufactures.map((manufacture, index) => (
                                <tr key={manufacture.id}>
                                    <td>{index + 1}</td>
                                    {/* <td>{manufacture.id}</td> */}
                                    <td>{manufacture.manufactureName}</td>
                                    <td>{manufacture.productionLiscenseNumber}</td>
                                    <td>{manufacture.placeOfOrigin}</td>
                                    <td>
                                        <RecordActions name={manufacture.manufactureName} onUpdate={() => onSelectManufacture(manufacture)} onDelete={() => onDeleteManufacture(manufacture.id)} />
                                    </td>
                                </tr>


                            ))}
                            {filteredManufactures.length === 0 && (
                                <tr>
                                    <td colSpan={5}>
                                        No manufacturers found
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
