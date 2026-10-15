
import NavBar from "../components/navBar";
import ManufactureForm from "../components/manufactureForm";
import ManufactureMenu from "../components/manufactureMenu";
import type { Manufacture } from '../types/types'
import { useState } from 'react'

import "../styles/home.css";

export default function Manufacture() {

    const [manufactures, setManufactures] = useState<Manufacture[]>([])
    const [selectManufacture, setSelectManufacture] = useState<Manufacture | null>(null)

    const handleAddManufacture = (newManufacture: Omit<Manufacture, "id">) => {
        setManufactures(prevManufactures => [
            ...prevManufactures,
            {
                ...newManufacture,
                id: prevManufactures.length > 0
                    ? Math.max(...prevManufactures.map(m => m.id)) + 1
                    : 1
            }
        ]);
    };

    const handleDeleteManufacture = (id: number) => {

        setManufactures(prevManufactures =>
            prevManufactures.filter(manuafcture => manuafcture.id !== id)
        );

        setSelectManufacture(null);


    }

    const handleSaveManufacture = (updatedManufacture: Manufacture) => {


        setManufactures(prevManufactures =>
            prevManufactures.map(manufacture =>
                manufacture.id === updatedManufacture.id ?
                    updatedManufacture :
                    manufacture
            ))

    }




    return (
        <div className="home-container">
            <aside className="home-sidebar">
                <NavBar />
            </aside>

            <main className="home-main">
                <div className="home-header">
                    <h1>Dashboard</h1>
                    <p>Manage your Manufactures</p>
                </div>

                <div className="home-content">
                    <section className="home-form-section">
                        <ManufactureForm onAddManufacture={handleAddManufacture} selectManufacture={selectManufacture} onSaveManufacture={handleSaveManufacture} onDeleteManufacture={handleDeleteManufacture} />
                    </section>

                    <section className="home-table-section" >
                        <ManufactureMenu manufactures={manufactures} onSelectManufacture={setSelectManufacture} />
                    </section>
                </div>
            </main>
        </div>
    );
}
