import React, { useState, useEffect } from "react";
import api from "../api/api";

export default function Property() {
    const [properties, setProperties] = useState([]);
    const [form, setForm] = useState({
        PropertyID: "",
        name: "",
        location: "",
        TotalRooms: "",
        OwnerID: ""
    });

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            const res = await api.get("/Property");
            setProperties(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (form.PropertyID) {
                // Update existing property
                await api.put(`/Property/${form.PropertyID}`, form);
                alert("Property updated!");
            } else {
                // Add new property
                await api.post("/Property", form);
                alert("Property added!");
            }
            fetchProperties();
            setForm({ PropertyID: "", name: "", location: "", TotalRooms: "", OwnerID: "" });
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || "Error with property operation");
        }
    };

    const handleEdit = (property) => {
        setForm({
            PropertyID: property.PropertyID,
            name: property.name,
            location: property.location,
            TotalRooms: property.TotalRooms,
            OwnerID: property.OwnerID
        });
    };

    const handleDelete = async (propertyId) => {
        if (window.confirm("Are you sure you want to delete this property?")) {
            try {
                await api.delete(`/Property/${propertyId}`);
                alert("Property deleted!");
                fetchProperties();
            } catch (err) {
                console.error(err);
                alert(err.response?.data?.error || "Error deleting property");
            }
        }
    };

    return (
        <div>
            <h2>Properties</h2>
            <form onSubmit={handleSubmit}>
                <input name="PropertyID" placeholder="PropertyID" value={form.PropertyID} onChange={handleChange} required />
                <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
                <input name="location" placeholder="Location" value={form.location} onChange={handleChange} required />
                <input name="TotalRooms" placeholder="TotalRooms" type="number" value={form.TotalRooms} onChange={handleChange} required />
                <input name="OwnerID" placeholder="OwnerID" type="number" value={form.OwnerID} onChange={handleChange} required />
                <button type="submit">Add Property</button>
            </form>

            <table border="1" style={{ marginTop: "20px" }}>
                <thead>
                    <tr>
                        <th>ID</th><th>Name</th><th>Location</th><th>TotalRooms</th><th>OwnerID</th>
                    </tr>
                </thead>
                <tbody>
                    {properties.map(p => (
                        <tr key={p.PropertyID}>
                            <td>{p.PropertyID}</td>
                            <td>{p.name}</td>
                            <td>{p.location}</td>
                            <td>{p.TotalRooms}</td>
                            <td>{p.OwnerID}</td>
                            <td>
                                <button onClick={() => handleEdit(p)}>Edit</button>
                                <button onClick={() => handleDelete(p.PropertyID)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
