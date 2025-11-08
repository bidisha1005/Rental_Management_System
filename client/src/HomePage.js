// src/HomePage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./HomePage.css";

function HomePage() {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [formData, setFormData] = useState({ name: "", id: "" });

  const handleOpenForm = (userRole) => {
    setRole(userRole);
    setFormData({ name: "", id: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.name.trim() === "" || formData.id.trim() === "") {
      alert("Please fill in both fields!");
      return;
    }

    if (role === "tenant") {
      try {
        // Validate tenant login
        const res = await axios.post("http://localhost:5002/Tenant/login", {
          name: formData.name,
          tenantID: formData.id
        });

        // Save tenant info in localStorage or state
        localStorage.setItem("tenant", JSON.stringify(res.data.tenant));

        // Navigate to tenant dashboard
        navigate(`/tenant/${formData.id}`);
      } catch (err) {
        alert(err.response?.data?.error || "Tenant login failed");
        return;
      }
    } else if (role === "owner") {
      try {
        // Validate owner login
        const res = await axios.post("http://localhost:5002/Owner/login", {
          name: formData.name,
          ownerID: formData.id
        });
        
        // Save owner info in localStorage
        localStorage.setItem("userId", res.data.owner.OwnerID);
        localStorage.setItem("owner", JSON.stringify(res.data.owner));
        
        // Navigate to owner dashboard
        navigate(`/${role}`);
      } catch (err) {
        alert(err.response?.data?.error || "Owner login failed");
        return;
      }
    }
  };

  return (
    <div className="home-background">
      <div className="home-overlay">
        <h1 className="home-title">Welcome to Rental Management</h1>
        <div className="home-button-container">
          <button className="home-button" onClick={() => handleOpenForm("owner")}>
            Owner
          </button>
          <button className="home-button" onClick={() => handleOpenForm("tenant")}>
            Tenant
          </button>
        </div>
      </div>

      {/* Modal Form */}
      {role && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2>Enter {role === "owner" ? "Owner" : "Tenant"} Details</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder={`${role === "owner" ? "Owner" : "Tenant"} Name`}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder={`${role === "owner" ? "Owner" : "Tenant"} ID`}
                value={formData.id}
                onChange={(e) =>
                  setFormData({ ...formData, id: e.target.value })
                }
                required
              />
              <div className="modal-buttons">
                <button type="submit" className="submit-btn">
                  Submit
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setRole(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
