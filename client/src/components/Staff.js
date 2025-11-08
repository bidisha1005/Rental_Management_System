import React, { useState, useEffect } from "react";
import api from "../api/api";

export default function Staff() {
    const [staff, setStaff] = useState([]);
    const [form, setForm] = useState({
        StaffID: "",
        name: "",
        role: "",
        contact: "",
        AvailabilityStatus: ""
    });

    // ✅ Correct useEffect — just call fetchStaff, do NOT return anything
    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const res = await api.get("/Staff");
            setStaff(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            await api.post("/Staff", form);
            alert("Staff added!");
            fetchStaff();
            setForm({ StaffID: "", name: "", role: "", contact: "", AvailabilityStatus: "" });
        } catch (err) {
            console.error(err);
            alert("Error adding staff");
        }
    };

    return (
        <div>
            <h2>Staff</h2>
            <form onSubmit={handleSubmit}>
                <input name="StaffID" placeholder="StaffID" value={form.StaffID} onChange={handleChange} required />
                <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
                <input name="role" placeholder="Role" value={form.role} onChange={handleChange} required />
                <input name="contact" placeholder="Contact" value={form.contact} onChange={handleChange} required />
                <input name="AvailabilityStatus" placeholder="AvailabilityStatus" value={form.AvailabilityStatus} onChange={handleChange} required />
                <button type="submit">Add Staff</button>
            </form>

            <table border="1" style={{ marginTop: "20px" }}>
                <thead>
                    <tr>
                        <th>ID</th><th>Name</th><th>Role</th><th>Contact</th><th>AvailabilityStatus</th>
                    </tr>
                </thead>
                <tbody>
                    {staff.map(s => (
                        <tr key={s.StaffID}>
                            <td>{s.StaffID}</td>
                            <td>{s.name}</td>
                            <td>{s.role}</td>
                            <td>{s.contact}</td>
                            <td>{s.AvailabilityStatus}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
