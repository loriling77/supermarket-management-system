
import "../styles/productForm.css";
import type { Manufacture } from '../types/types'
import type { SubmitEventHandler } from 'react'
import { useState, useEffect } from 'react'

interface ManufactureFormProps {
    onAddManufacture: (manufacture: Omit<Manufacture, "id">) => void
    selectManufacture: Manufacture | null;
    onDeleteManufacture: (id: number) => void
    onSaveManufacture: (manufacture: Manufacture) => void
}
export default function ManufactureForm({ onAddManufacture, selectManufacture, onDeleteManufacture, onSaveManufacture }: ManufactureFormProps) {

    const [manufactureName, setManufactureName] = useState("")
    const [productionLiscenseNumber, setProductionLiscenseNumber] = useState("")
    const [placeOfOrigin, setPlaceOfOrigin] = useState("")

    const handleAdd: SubmitEventHandler<HTMLElement> = async (e) => {
        e.preventDefault();

        try {
            await onAddManufacture({

                manufactureName,
                productionLiscenseNumber,
                placeOfOrigin,


            })

            setManufactureName("");
            setProductionLiscenseNumber("");
            setPlaceOfOrigin("");

        } catch (error) {
            console.error(error)

        }

    }

    useEffect(() => {
        if (selectManufacture) {
            setManufactureName(selectManufacture.manufactureName);
            setProductionLiscenseNumber(selectManufacture.productionLiscenseNumber);
            setPlaceOfOrigin(selectManufacture.placeOfOrigin);

        }
    }, [selectManufacture]);

    const handleDelete = async () => {
        if (!selectManufacture) {
            alert("Please select a manufacture first!");
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to delete this manufacture?"
        );

        if (!confirmed) {
            return;
        }
        try {
            await onDeleteManufacture(selectManufacture.id);

            setManufactureName("");
            setProductionLiscenseNumber("");
            setPlaceOfOrigin("");
        } catch (error) { console.error(error) }



    }

    const handleSave = async () => {


        if (!selectManufacture) {
            alert("Please select a manufacture first!")
            return
        }
        if (!manufactureName.trim() ||
            !productionLiscenseNumber.trim() ||
            !placeOfOrigin.trim()


        ) {
            alert('Please enter valid manufacture information')
            return
        }
        try {
            await onSaveManufacture({
                id: selectManufacture.id,

                manufactureName: manufactureName,
                productionLiscenseNumber,
                placeOfOrigin


            })

        } catch (error) { console.error(error) }


    }


    return (
        <div className="product-form-container">
            <form className="product-form" onSubmit={handleAdd}>
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
                        value={manufactureName}
                        onChange={(e) => { setManufactureName(e.target.value) }} />
                </div>

                <div className="input-group">
                    <label htmlFor="manufacturename">Production License Number</label>
                    <input
                        id="manufacturename"
                        type="text"
                        value={productionLiscenseNumber}
                        placeholder="Enter manufacturer name"
                        required
                        onChange={(e) => { setProductionLiscenseNumber(e.target.value) }}
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="category">Place of Origin</label>
                    <input
                        id="category"
                        type="text"
                        value={placeOfOrigin}
                        placeholder="Enter category"
                        required
                        onChange={(e) => { setPlaceOfOrigin(e.target.value) }}
                    />
                </div>



                <div className="form-actions">
                    <button type="submit" className="Add-btn" >
                        Add
                    </button>


                    <button type="button" className="Save-btn" onClick={handleSave}>
                        Save
                    </button>

                    <button type="button" className="Delete-btn" onClick={handleDelete}>
                        Delete
                    </button>
                </div>
            </form>
        </div>
    );
}
