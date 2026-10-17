
import NavBar from "../components/navBar";
import ManufactureForm from "../components/manufactureForm";
import ManufactureMenu from "../components/manufactureMenu";
import Search from "../components/search";
import type { Manufacture } from '../types/types'
import { useState, useEffect } from 'react'
import {
    getManufactures,
    getManufacture,
    addManufacture,
    updateManufacture,
    deleteManufacture
} from "../api/manufactureApi";


import "../styles/home.css";

export default function Manufacture() {

    const [manufactures, setManufactures] = useState<Manufacture[]>([])
    const [selectManufacture, setSelectManufacture] = useState<Manufacture | null>(null)
    const [search, setSearch] = useState<string>("")
    const [error, setError] = useState("")

    useEffect(() => {
        const loadManufactures = async () => {
            try {
                const data = await getManufactures()
                setManufactures(data)
            } catch (err) {
                console.log(err)
                setError("Failed to get the products")
            }
        }
        loadManufactures()
    })
    const handleAddManufacture = async (newManufacture: Omit<Manufacture, "id">) => {
        try {
            setError("")
            const createdManufacture = await addManufacture(newManufacture)

            setManufactures(prevManufactures => [
                ...prevManufactures, createdManufacture

            ]);

        } catch (err) {
            console.log(err)
            setError("Failed to add  a new Manufacture")
        }


    };

    const handleDeleteManufacture = async (id: number) => {
        try {

            setError("")
            await deleteManufacture(id)
            setManufactures(prevManufactures =>
                prevManufactures.filter(manuafcture => manuafcture.id !== id)
            );

            setSelectManufacture(null);


        } catch (err) {
            console.log(err)
            setError("Failed to delete Manufacture")
        }


    }

    const handleSaveManufacture = async (updatedManufacture: Manufacture) => {
        try {
            setError("")
            await updateManufacture(updatedManufacture)

            setManufactures(prevManufactures =>
                prevManufactures.map(manufacture =>
                    manufacture.id === updatedManufacture.id ?
                        updatedManufacture :
                        manufacture
                ))
        } catch (err) {
            console.log(err)
            setError("Failed to update manufacture")
        }



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
                {error && (
                    <p role="alert" style={{ color: "red" }}>
                        {error}
                    </p>
                )}


                <div className="home-content">
                    <section className="home-form-section">
                        <ManufactureForm onAddManufacture={handleAddManufacture} selectManufacture={selectManufacture} onSaveManufacture={handleSaveManufacture} onDeleteManufacture={handleDeleteManufacture} />
                    </section>

                    <section className="home-table-section" >
                        <Search onSearch={setSearch}></Search>
                        <ManufactureMenu manufactures={manufactures} onSelectManufacture={setSelectManufacture} search={search} />
                    </section>
                </div>
            </main>
        </div>
    );
}
