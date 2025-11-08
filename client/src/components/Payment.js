import React, { useState, useEffect } from "react";
import api from "../api/api";

export default function Payment() {
    const [payments, setPayments] = useState([]);
    const [form, setForm] = useState({
        PaymentID: "",
        Amount: "",
        Date: "",
        Status: "",
        PaymentMode: "",
        TenantID: ""
    });

    // ✅ Correct useEffect
    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const res = await api.get("/Payment");
            setPayments(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            await api.post("/Payment", form);
            alert("Payment added!");
            fetchPayments();
            setForm({ PaymentID: "", Amount: "", Date: "", Status: "", PaymentMode: "", TenantID: "" });
        } catch (err) {
            console.error(err);
            alert("Error adding payment");
        }
    };

    return (
        <div>
            <h2>Payments</h2>
            <form onSubmit={handleSubmit}>
                <input name="PaymentID" placeholder="PaymentID" value={form.PaymentID} onChange={handleChange} required />
                <input name="Amount" placeholder="Amount" type="number" value={form.Amount} onChange={handleChange} required />
                <input name="Date" placeholder="Date" type="date" value={form.Date} onChange={handleChange} required />
                <input name="Status" placeholder="Status" value={form.Status} onChange={handleChange} required />
                <input name="PaymentMode" placeholder="PaymentMode" value={form.PaymentMode} onChange={handleChange} required />
                <input name="TenantID" placeholder="TenantID" type="number" value={form.TenantID} onChange={handleChange} required />
                <button type="submit">Add Payment</button>
            </form>

            <table border="1" style={{ marginTop: "20px" }}>
                <thead>
                    <tr>
                        <th>ID</th><th>Amount</th><th>Date</th><th>Status</th><th>PaymentMode</th><th>TenantID</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.map(p => (
                        <tr key={p.PaymentID}>
                            <td>{p.PaymentID}</td>
                            <td>{p.Amount}</td>
                            <td>{p.Date}</td>
                            <td>{p.Status}</td>
                            <td>{p.PaymentMode}</td>
                            <td>{p.TenantID}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
