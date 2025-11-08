import React, { useState, useEffect } from "react";
import api from "../api/api";

export default function ServiceRequest({ tenantView = false, ownerId, tenantId }) {
    const [requests, setRequests] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [form, setForm] = useState({
        Category: "",
        Description: "",
        DateRaised: new Date().toISOString().split('T')[0],
        TenantID: tenantId || "",
        StaffID: "",
        DateResolved: ""
    });

    useEffect(() => {
        fetchRequests();
        if (!tenantView) {
            fetchStaffList();
        }
    }, [ownerId, tenantId]);

    const fetchRequests = async () => {
        try {
            const params = tenantView ? { tenantId } : { ownerId };
            const res = await api.get("/ServiceRequest", { params });
            setRequests(res.data);
        } catch (err) {
            console.error(err);
            alert("Error fetching service requests");
        }
    };

    const fetchStaffList = async () => {
        try {
            const res = await api.get("/Staff");
            setStaffList(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/ServiceRequest", form);
            alert("Service request submitted!");
            fetchRequests();
            setForm({
                ...form,
                Category: "",
                Description: "",
                DateRaised: new Date().toISOString().split('T')[0]
            });
        } catch (err) {
            console.error(err);
            alert("Error submitting service request");
        }
    };

    const handleResolve = async (requestId, staffId) => {
        try {
            const dateResolved = new Date().toISOString().split('T')[0];
            await api.patch(`/ServiceRequest/${requestId}/resolve`, {
                DateResolved: dateResolved,
                StaffID: staffId
            });
            alert("Service request resolved!");
            fetchRequests();
        } catch (err) {
            console.error(err);
            alert("Error resolving service request");
        }
    };

    return (
        <div>
            <h2>Service Requests</h2>
            
            {tenantView && (
                <form onSubmit={handleSubmit}>
                    <select name="Category" value={form.Category} onChange={handleChange} required>
                        <option value="">Select Category</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Cleaning">Cleaning</option>
                        <option value="Security">Security</option>
                        <option value="Other">Other</option>
                    </select>
                    <textarea
                        name="Description"
                        placeholder="Description"
                        value={form.Description}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="date"
                        name="DateRaised"
                        value={form.DateRaised}
                        onChange={handleChange}
                        required
                    />
                    <button type="submit">Submit Request</button>
                </form>
            )}

            <table border="1" style={{ marginTop: "20px" }}>
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Date Raised</th>
                        {!tenantView && <th>Tenant Name</th>}
                        {!tenantView && <th>Staff Assigned</th>}
                        <th>Date Resolved</th>
                        {!tenantView && <th>Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {requests.map(req => (
                        <tr key={req.RequestID}>
                            <td>{req.Category}</td>
                            <td>{req.Description}</td>
                            <td>{req.Status}</td>
                            <td>{new Date(req.DateRaised).toLocaleDateString()}</td>
                            {!tenantView && (
                                <td>
                                    <div>{req.TenantName || `Tenant ${req.TenantID}`}</div>
                                    <div style={{ fontSize: '0.9em', color: '#666' }}>
                                        {req.DateRaised ? `Raised: ${new Date(req.DateRaised).toLocaleDateString()}` : ''}
                                    </div>
                                </td>
                            )}
                            {!tenantView && (
                                <td>
                                    {req.Status !== 'Completed' ? (
                                        <select
                                            value={req.StaffID || ""}
                                            onChange={(e) => handleResolve(req.RequestID, e.target.value)}
                                        >
                                            <option value="">Select Staff</option>
                                            {staffList.map(staff => (
                                                <option key={staff.StaffID} value={staff.StaffID}>
                                                    {staff.name} ({staff.role})
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        req.StaffName
                                    )}
                                </td>
                            )}
                            <td>
                                {req.DateResolved ? 
                                    new Date(req.DateResolved).toLocaleDateString() : 
                                    'Pending'
                                }
                            </td>
                            {!tenantView && (
                                <td>
                                    {req.Status !== 'Completed' && (
                                        <input
                                            type="date"
                                            onChange={(e) => handleResolve(req.RequestID, req.StaffID, e.target.value)}
                                        />
                                    )}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}