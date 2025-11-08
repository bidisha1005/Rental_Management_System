import React, { useState, useEffect } from "react";
import api from "../api/api";

export default function Tenant() {
  const [tenants, setTenants] = useState([]);
  const [form, setForm] = useState({
    FirstName: "",
    MiddleName: "",
    LastName: "",
    emails: [""],
    phones: [""],
    CheckInDate: "",
    CheckOutDate: "",
    PaymentStatus: "",
    RoomID: ""
  });

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const res = await api.get("/Tenant");
      setTenants(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleArrayChange = (e, index, field) => {
    const newArray = [...form[field]];
    newArray[index] = e.target.value;
    setForm({ ...form, [field]: newArray });
  };

  const addField = (field) => {
    setForm({ ...form, [field]: [...form[field], ""] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/Tenant", form);
      alert("Tenant added!");
      fetchTenants();
      setForm({
        FirstName: "",
        MiddleName: "",
        LastName: "",
        emails: [""],
        phones: [""],
        CheckInDate: "",
        CheckOutDate: "",
        PaymentStatus: "",
        RoomID: ""
      });
    } catch (err) {
      console.error(err);
      alert("Error adding tenant");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Tenant Management</h2>
      <form onSubmit={handleSubmit}>
        <input name="FirstName" placeholder="First Name" value={form.FirstName} onChange={handleChange} required />
        <input name="MiddleName" placeholder="Middle Name" value={form.MiddleName} onChange={handleChange} />
        <input name="LastName" placeholder="Last Name" value={form.LastName} onChange={handleChange} />

        <h4>Emails:</h4>
        {form.emails.map((email, i) => (
          <input
            key={i}
            value={email}
            placeholder={`Email ${i + 1}`}
            onChange={(e) => handleArrayChange(e, i, "emails")}
          />
        ))}
        <button type="button" onClick={() => addField("emails")}>+ Add Email</button>

        <h4>Phones:</h4>
        {form.phones.map((phone, i) => (
          <input
            key={i}
            value={phone}
            placeholder={`Phone ${i + 1}`}
            onChange={(e) => handleArrayChange(e, i, "phones")}
          />
        ))}
        <button type="button" onClick={() => addField("phones")}>+ Add Phone</button>

        <input type="date" name="CheckInDate" value={form.CheckInDate} onChange={handleChange} required />
        <input type="date" name="CheckOutDate" value={form.CheckOutDate} onChange={handleChange} />
        <input name="PaymentStatus" placeholder="Payment Status" value={form.PaymentStatus} onChange={handleChange} required />
        <input name="RoomID" type="number" placeholder="Room ID" value={form.RoomID} onChange={handleChange} required />

        <button type="submit">Add Tenant</button>
      </form>

      <h3 style={{ marginTop: "30px" }}>Tenants</h3>
      <table border="1">
        <thead>
          <tr>
            <th>TenantID</th>
            <th>Name</th>
            <th>CheckIn</th>
            <th>CheckOut</th>
            <th>Payment</th>
            <th>RoomID</th>
          </tr>
        </thead>
        <tbody>
          {tenants.map((t) => (
            <tr key={t.TenantID}>
              <td>{t.TenantID}</td>
              <td>{t.name}</td>
              <td>{t.CheckInDate}</td>
              <td>{t.CheckOutDate}</td>
              <td>{t.PaymentStatus}</td>
              <td>{t.RoomID}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
