import React, { useState, useEffect } from "react";
import api from "../api/api";

export default function Room() {
    const [rooms, setRooms] = useState([]);
    const [form, setForm] = useState({
        RoomID: "",
        BedCount: "",
        OccupiedBeds: "",
        RentAmount: "",
        RoomType: "",
        PropertyID: ""
    });

    // ✅ Correct useEffect
    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const res = await api.get("/Room");
            setRooms(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            if (form.RoomID) {
                // Update existing room
                await api.put(`/Room/${form.RoomID}`, form);
                alert("Room updated!");
            } else {
                // Add new room
                await api.post("/Room", form);
                alert("Room added!");
            }
            fetchRooms();
            setForm({ RoomID: "", BedCount: "", OccupiedBeds: "", RentAmount: "", RoomType: "", PropertyID: "" });
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || "Error with room operation");
        }
    };

    const handleEdit = (room) => {
        setForm({
            RoomID: room.RoomID,
            BedCount: room.BedCount,
            OccupiedBeds: room.OccupiedBeds,
            RentAmount: room.RentAmount,
            RoomType: room.RoomType,
            PropertyID: room.PropertyID
        });
    };

    const handleDelete = async (roomId) => {
        if (window.confirm("Are you sure you want to delete this room?")) {
            try {
                await api.delete(`/Room/${roomId}`);
                alert("Room deleted!");
                fetchRooms();
            } catch (err) {
                console.error(err);
                alert(err.response?.data?.error || "Error deleting room");
            }
        }
    };

    return (
        <div>
            <h2>Rooms</h2>
            <form onSubmit={handleSubmit}>
                <input name="RoomID" placeholder="RoomID" value={form.RoomID} onChange={handleChange} required />
                <input name="BedCount" placeholder="BedCount" type="number" value={form.BedCount} onChange={handleChange} required />
                <input name="OccupiedBeds" placeholder="OccupiedBeds" type="number" value={form.OccupiedBeds} onChange={handleChange} required />
                <input name="RentAmount" placeholder="RentAmount" type="number" value={form.RentAmount} onChange={handleChange} required />
                <input name="RoomType" placeholder="RoomType" value={form.RoomType} onChange={handleChange} required />
                <input name="PropertyID" placeholder="PropertyID" type="number" value={form.PropertyID} onChange={handleChange} required />
                <button type="submit">Add Room</button>
            </form>

            <table border="1" style={{ marginTop: "20px" }}>
                <thead>
                    <tr>
                        <th>ID</th><th>BedCount</th><th>OccupiedBeds</th><th>RentAmount</th><th>RoomType</th><th>PropertyID</th>
                    </tr>
                </thead>
                <tbody>
                    {rooms.map(r => (
                        <tr key={r.RoomID}>
                            <td>{r.RoomID}</td>
                            <td>{r.BedCount}</td>
                            <td>{r.OccupiedBeds}</td>
                            <td>{r.RentAmount}</td>
                            <td>{r.RoomType}</td>
                            <td>{r.PropertyID}</td>
                            <td>
                                <button onClick={() => handleEdit(r)}>Edit</button>
                                <button onClick={() => handleDelete(r.RoomID)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
