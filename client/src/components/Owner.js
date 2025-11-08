import React, { useState, useEffect } from "react";
import api from "../api/api";
import "./OwnerDashboard.css";

export default function Owner() {
    // States for different data types
    const [activeTab, setActiveTab] = useState('properties');
    const [properties, setProperties] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [payments, setPayments] = useState([]);
    
    const [staff, setStaff] = useState([]);
    const [requests, setRequests] = useState([]);
    const [feedback, setFeedback] = useState([]);
    const [currentPhone, setCurrentPhone] = useState('');
    const [currentEmail, setCurrentEmail] = useState('');
    const [editingRoomId, setEditingRoomId] = useState(null);

    // Form states
    const [propertyForm, setPropertyForm] = useState({
        name: '',
        location: '',
        TotalRooms: ''
    });
    const [editingPropertyId, setEditingPropertyId] = useState(null);

    const [roomForm, setRoomForm] = useState({
        BedCount: '',
        RentAmount: '',
        RoomType: '',
        PropertyID: ''
    });

    const [tenantForm, setTenantForm] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        phones: [], // Array to hold multiple phone numbers
        emails: [], // Array to hold multiple email addresses
        CheckInDate: '',
        CheckOutDate: '',
        RoomID: ''
    });
    const [editingTenantId, setEditingTenantId] = useState(null);

    const [staffForm, setStaffForm] = useState({
        name: '',
        role: '',
        contact: '',
        AvailabilityStatus: ''
    });

    // Fetch all data on component mount
    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
    try {
        const ownerId = localStorage.getItem('userId');

        const propertiesRes = await api.get("/Property");
        // Only keep properties owned by this owner
        const ownerProperties = propertiesRes.data.filter(p => p.OwnerID === parseInt(ownerId));
        setProperties(ownerProperties);

        const roomsRes = await api.get("/Room");
        // Only include rooms belonging to the owner's properties
        const ownerRooms = roomsRes.data.filter(r => ownerProperties.some(p => p.PropertyID === r.PropertyID));
        setRooms(ownerRooms);

        const tenantsRes = await api.get("/Tenant");
        // Only include tenants in the owner's rooms
        const ownerTenants = tenantsRes.data.filter(t => ownerRooms.some(r => r.RoomID === t.RoomID));
        setTenants(ownerTenants);

        const paymentsRes = await api.get("/Payment");
        // Only include payments from the owner's tenants
        const ownerPayments = paymentsRes.data.filter(p => ownerTenants.some(t => t.TenantID === p.TenantID));
        setPayments(ownerPayments);

        const staffRes = await api.get("/Staff");
        setStaff(staffRes.data); // Staff may be global or filtered differently

        const requestsRes = await api.get("/ServiceRequest");
        const ownerRequests = requestsRes.data.filter(req => ownerTenants.some(t => t.TenantID === req.TenantID));
        setRequests(ownerRequests);





        const feedbackRes = await api.get("/Feedback");
        const ownerFeedback = feedbackRes.data.filter(f => ownerTenants.some(t => t.TenantID === f.TenantID));
        setFeedback(ownerFeedback);

    } catch (err) {
        console.error("Error fetching data:", err);
    }
};

    // Helper to format tenant display name
    const tenantDisplayName = (tenant) => {
        if (!tenant) return 'Unknown';
        if (tenant.FullName) return tenant.FullName;
        return [tenant.FirstName, tenant.MiddleName, tenant.LastName].filter(Boolean).join(' ');
    };


    // Handle form submissions
    const handlePropertySubmit = async (e) => {
        e.preventDefault();
        
        // Add validation
        if (!propertyForm.name || !propertyForm.location || !propertyForm.TotalRooms) {
            alert("Please fill in all required fields");
            return;
        }

        try {
            const ownerId = localStorage.getItem('userId');
            const propertyData = {
                ...propertyForm,
                OwnerID: ownerId
            };

            if (editingPropertyId) {
                // Update existing property
                await api.put(`/Property/${editingPropertyId}`, propertyData);
                alert("Property updated successfully!");
                setEditingPropertyId(null);
            } else {
                // Create new property
                await api.post("/Property", propertyData);
                alert("Property added successfully!");
            }
            
            fetchAllData();
            setPropertyForm({ name: '', location: '', TotalRooms: '' });
        } catch (err) {
            console.error("Error saving property:", err);
            alert(err.response?.data?.message || "Error saving property");
        }
    };

    const handleRoomSubmit = async (e) => {
    e.preventDefault();

    if (!roomForm.PropertyID || !roomForm.BedCount || !roomForm.RentAmount || !roomForm.RoomType) {
        alert("Please fill in all required fields for the room");
        return;
    }

    try {
        if (editingRoomId) {
            // ✅ Update existing room
            await api.put(`/Room/${editingRoomId}`, roomForm);
            alert("Room updated successfully!");
            setEditingRoomId(null);
        } else {
            // 🆕 Add new room
            await api.post("/Room", { ...roomForm, OccupiedBeds: 0 });
            alert("Room added successfully!");
        }

        fetchAllData();
        setRoomForm({ BedCount: '', RentAmount: '', RoomType: '', PropertyID: '' });
    } catch (err) {
        console.error("Error saving room:", err);
        alert(err.response?.data?.error || "Error saving room");
    }
};


    const handleTenantSubmit = async (e) => {
    e.preventDefault();

    // Basic validation for essential fields
    if (
        !tenantForm.firstName ||
        !tenantForm.lastName ||
        !tenantForm.CheckInDate ||
        !tenantForm.RoomID ||
        tenantForm.phones.length === 0 ||
        tenantForm.emails.length === 0
    ) {
        alert("Please fill in First Name, Last Name, Check-in Date, Room, and add at least one Phone and one Email.");
        return;
    }

    try {
        const ownerId = localStorage.getItem('userId'); // get logged-in owner ID

        const tenantPayload = {
            firstName: tenantForm.firstName,
            middleName: tenantForm.middleName,
            lastName: tenantForm.lastName,
            phones: tenantForm.phones,   // ✅ renamed correctly
            emails: tenantForm.emails,   // ✅ renamed correctly
            CheckInDate: tenantForm.CheckInDate,
            CheckOutDate: tenantForm.CheckOutDate,
            RoomID: tenantForm.RoomID,
            OwnerID: ownerId             // ✅ added this line
        };

        console.log("[Tenant POST] Sending payload:", tenantPayload);
        if (editingTenantId) {
            // Update existing tenant
            await api.put(`/Tenant/${editingTenantId}`, tenantPayload);
            alert("Tenant updated successfully!");
            setEditingTenantId(null);
        } else {
            await api.post("/Tenant", tenantPayload);
            alert("Tenant added successfully!");
        }
        fetchAllData();

        setTenantForm({
            firstName: '',
            middleName: '',
            lastName: '',
            phones: [],
            emails: [],
            CheckInDate: '',
            CheckOutDate: '',
            RoomID: ''
        });
        setCurrentPhone('');
        setCurrentEmail('');
    } catch (err) {
        console.error("[Frontend] Error adding tenant:", err.response ? err.response.data : err);
        alert(`Error adding tenant: ${err.response?.data?.error || err.message}`);
    }
};

    const handleEditTenantClick = (tenant) => {
        // Populate the tenant form with the selected tenant's data
        setEditingTenantId(tenant.TenantID);
        setTenantForm({
            firstName: tenant.FirstName || '',
            middleName: tenant.MiddleName || '',
            lastName: tenant.LastName || '',
            phones: tenant.Phones ? tenant.Phones.split(/,\s*/) : [],
            emails: tenant.Emails ? tenant.Emails.split(/,\s*/) : [],
            CheckInDate: tenant.CheckInDate ? new Date(tenant.CheckInDate).toISOString().slice(0,10) : '',
            CheckOutDate: tenant.CheckOutDate ? new Date(tenant.CheckOutDate).toISOString().slice(0,10) : '',
            RoomID: tenant.RoomID || ''
        });
    };

    const handleDeleteTenant = async (tenantId) => {
        if (!window.confirm('Are you sure you want to delete this tenant? This will remove contact info as well.')) return;
        try {
            await api.delete(`/Tenant/${tenantId}`);
            fetchAllData();
            // If we were editing this tenant, clear the form
            if (editingTenantId === tenantId) {
                setEditingTenantId(null);
                setTenantForm({ firstName: '', middleName: '', lastName: '', phones: [], emails: [], CheckInDate: '', CheckOutDate: '', RoomID: '' });
            }
        } catch (err) {
            console.error('Error deleting tenant', err);
            alert('Error deleting tenant');
        }
    };


    const handleStaffSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/Staff", staffForm);
            alert("Staff member added successfully!");
            fetchAllData();
            setStaffForm({ name: '', role: '', contact: '', AvailabilityStatus: '' });
        } catch (err) {
            alert("Error adding staff member");
        }
    };

    // Handle updates
    const handleUpdateRequestStatus = async (requestId, newStatus, staffId) => {
        try {
            console.log("Updating request:", requestId, "with status:", newStatus, "and staffId:", staffId);
            await api.put(`/ServiceRequest/${requestId}`, {
                Status: newStatus,
                StaffID: staffId === "" ? null : staffId // Convert empty string to null
            });
            await fetchAllData(); // Refresh data after update
        } catch (err) {
            console.error("Error updating service request:", err);
            alert("Error updating service request: " + (err.response?.data?.error || err.message));
        }
    };

    // Dynamic input handlers for phone and email
    const handleAddPhone = () => {
        if (currentPhone.trim() && !tenantForm.phones.includes(currentPhone.trim())) {
            setTenantForm({
                ...tenantForm,
                phones: [...tenantForm.phones, currentPhone.trim()]
            });
            setCurrentPhone('');
        }
    };

    const handleRemovePhone = (phoneToRemove) => {
        setTenantForm({
            ...tenantForm,
            phones: tenantForm.phones.filter(p => p !== phoneToRemove)
        });
    };

    const handleAddEmail = () => {
        if (currentEmail.trim() && !tenantForm.emails.includes(currentEmail.trim())) {
            setTenantForm({
                ...tenantForm,
                emails: [...tenantForm.emails, currentEmail.trim()]
            });
            setCurrentEmail('');
        }
    };

    const handleRemoveEmail = (emailToRemove) => {
        setTenantForm({
            ...tenantForm,
            emails: tenantForm.emails.filter(e => e !== emailToRemove)
        });
    };

    // Delete handlers
    const handleEditProperty = (property) => {
        setEditingPropertyId(property.PropertyID);
        setPropertyForm({
            name: property.name,
            location: property.location,
            TotalRooms: property.TotalRooms
        });
    };

    const handleDeleteProperty = async (propertyId) => {
        // Check if property has any rooms
        const propertyRooms = rooms.filter(r => r.PropertyID === propertyId);
        const confirmMessage = propertyRooms.length > 0 
            ? `Are you sure you want to delete this property? This will permanently delete all ${propertyRooms.length} associated rooms as well.`
            : 'Are you sure you want to delete this property?';

        if (!window.confirm(confirmMessage)) return;
        
        try {
            await api.delete(`/Property/${propertyId}`);
            fetchAllData();
            alert('Property and all associated rooms deleted successfully');
            if (editingPropertyId === propertyId) {
                setEditingPropertyId(null);
                setPropertyForm({ name: '', location: '', TotalRooms: '' });
            }
        } catch (err) {
            console.error('Error deleting property:', err);
            alert('Error deleting property and associated rooms');
        }
    };

    const handleDeleteRoom = async (roomId) => {
        if (window.confirm("Are you sure you want to delete this room?")) {
            try {
                await api.delete(`/Room/${roomId}`);
                fetchAllData();
            } catch (err) {
                alert("Error deleting room");
            }
        }
    };

    const handleEditRoom = (room) => {
    setEditingRoomId(room.RoomID);
    setRoomForm({
        BedCount: room.BedCount,
        RentAmount: room.RentAmount,
        RoomType: room.RoomType,
        PropertyID: room.PropertyID,
        OccupiedBeds: room.OccupiedBeds
    });
};

    return (
        <div className="owner-dashboard">
            <h1>Owner Dashboard</h1>
            
            <div className="dashboard-nav">
                <button onClick={() => setActiveTab('properties')}>Properties & Rooms</button>
                <button onClick={() => setActiveTab('tenants')}>Tenants</button>
                <button onClick={() => setActiveTab('payments')}>Payments</button>
                <button onClick={() => setActiveTab('staff')}>Staff</button>
                <button onClick={() => setActiveTab('requests')}>Service Requests</button>

                <button onClick={() => setActiveTab('feedback')}>Feedback</button>
            </div>

            <div className="dashboard-content">
                {activeTab === 'properties' && (
                    <div>
                        <h2>Properties and Rooms Management</h2>
                        <div className="form-section">
                            <h3>Add New Property</h3>
                            <form onSubmit={handlePropertySubmit}>
                                <input
                                    type="text"
                                    placeholder="Property Name"
                                    value={propertyForm.name}
                                    onChange={(e) => setPropertyForm({...propertyForm, name: e.target.value})}
                                />
                                <input
                                    type="text"
                                    placeholder="Location"
                                    value={propertyForm.location}
                                    onChange={(e) => setPropertyForm({...propertyForm, location: e.target.value})}
                                />
                                <input
                                    type="number"
                                    placeholder="Total Rooms"
                                    value={propertyForm.TotalRooms}
                                    onChange={(e) => setPropertyForm({...propertyForm, TotalRooms: e.target.value})}
                                />
                                <button type="submit">{editingPropertyId ? 'Update Property' : 'Add Property'}</button>
                            </form>

                            <h3>Add New Room</h3>
                            <form onSubmit={handleRoomSubmit}>
                                <select
                                    value={roomForm.PropertyID}
                                    onChange={(e) => setRoomForm({...roomForm, PropertyID: e.target.value})}
                                >
                                    <option value="">Select Property</option>
                                    {properties.map(p => (
                                        <option key={p.PropertyID} value={p.PropertyID}>{p.name}</option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    placeholder="Bed Count"
                                    value={roomForm.BedCount}
                                    onChange={(e) => setRoomForm({...roomForm, BedCount: e.target.value})}
                                />
                                <input
                                    type="number"
                                    placeholder="Rent Amount"
                                    value={roomForm.RentAmount}
                                    onChange={(e) => setRoomForm({...roomForm, RentAmount: e.target.value})}
                                />
                                <input
                                    type="text"
                                    placeholder="Room Type"
                                    value={roomForm.RoomType}
                                    onChange={(e) => setRoomForm({...roomForm, RoomType: e.target.value})}
                                />
                                <button type="submit">
                                    {editingRoomId ? 'Update Room' : 'Add Room'}
                                </button>

                            </form>
                        </div>

                        <div className="list-section">
                            <h3>Properties List</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Location</th>
                                        <th>Total Rooms</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {properties.map(property => (
                                        <tr key={property.PropertyID}>
                                            <td>{property.name}</td>
                                            <td>{property.location}</td>
                                            <td>{property.TotalRooms}</td>
                                            <td>
                                                <button onClick={() => handleEditProperty(property)}>Edit</button>
                                                <button onClick={() => handleDeleteProperty(property.PropertyID)} style={{ marginLeft: '8px' }}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <h3>Rooms List</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Property</th>
                                        <th>Room Type</th>
                                        <th>Beds</th>
                                        <th>Occupied</th>
                                        <th>Rent</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rooms.map(room => (
                                        <tr key={room.RoomID}>
                                            <td>{properties.find(p => p.PropertyID === room.PropertyID)?.name}</td>
                                            <td>{room.RoomType}</td>
                                            <td>{room.BedCount}</td>
                                            <td>{room.OccupiedBeds}</td>
                                            <td>${room.RentAmount}</td>
                                            <td>
                                                <button onClick={() => handleEditRoom(room)}>Edit</button>
                                                <button onClick={() => handleDeleteRoom(room.RoomID)} style={{ marginLeft: '8px' }}>Delete</button>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'tenants' && (
                    <div>
                        <h2>Tenant Management</h2>
                        <div className="form-section">
                            <h3>Add/Edit Tenant</h3>
                            <form onSubmit={handleTenantSubmit} className="tenant-form">
                                <input
                                    type="text"
                                    placeholder="First Name"
                                    value={tenantForm.firstName}
                                    onChange={(e) => setTenantForm({...tenantForm, firstName: e.target.value})}
                                    style={{ minWidth: '120px' }}
                                />
                                <input
                                    type="text"
                                    placeholder="Middle Name (Optional)"
                                    value={tenantForm.middleName}
                                    onChange={(e) => setTenantForm({...tenantForm, middleName: e.target.value})}
                                    style={{ minWidth: '120px' }}
                                />
                                <input
                                    type="text"
                                    placeholder="Last Name"
                                    value={tenantForm.lastName}
                                    onChange={(e) => setTenantForm({...tenantForm, lastName: e.target.value})}
                                    style={{ minWidth: '120px' }}
                                />
                                {/* --- Dynamic Phone Input --- */}
                                <div className="dynamic-input-group">
                                    <input
                                        type="text"
                                        placeholder="Phone Number"
                                        value={currentPhone}
                                        onChange={(e) => setCurrentPhone(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPhone())}
                                    />
                                    <button type="button" onClick={handleAddPhone}>+ Add Phone</button>
                                    <div className="tags-container">
                                        {tenantForm.phones.map((phone) => (
                                            <span key={phone} className="tag">
                                                {phone}
                                                <button type="button" onClick={() => handleRemovePhone(phone)}>x</button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                {/* --- Dynamic Email Input --- */}
                                <div className="dynamic-input-group">
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        value={currentEmail}
                                        onChange={(e) => setCurrentEmail(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddEmail())}
                                    />
                                    <button type="button" onClick={handleAddEmail}>+ Add Email</button>
                                    <div className="tags-container">
                                        {tenantForm.emails.map((email) => (
                                            <span key={email} className="tag">
                                                {email}
                                                <button type="button" onClick={() => handleRemoveEmail(email)}>x</button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <input
                                    type="date"
                                    placeholder="Check-in Date"
                                    value={tenantForm.CheckInDate}
                                    onChange={(e) => setTenantForm({...tenantForm, CheckInDate: e.target.value})}
                                />
                                <input
                                    type="date"
                                    placeholder="Check-out Date (Optional)"
                                    value={tenantForm.CheckOutDate}
                                    onChange={(e) => setTenantForm({...tenantForm, CheckOutDate: e.target.value})}
                                />
                                <select
                                    value={tenantForm.RoomID}
                                    onChange={(e) => setTenantForm({...tenantForm, RoomID: e.target.value})}
                                >
                                    <option value="">Select Room</option>
                                    {rooms.map(r => (
                                        <option key={r.RoomID} value={r.RoomID}>
                                            {properties.find(p => p.PropertyID === r.PropertyID)?.name} - Room {r.RoomID}
                                        </option>
                                    ))}
                                </select>
                                <button type="submit" style={{ flexBasis: '100%' }}>{editingTenantId ? 'Update Tenant' : 'Add Tenant'}</button>
                            </form>
                        </div>

                        <div className="list-section">
                            <h3>Tenants List</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Tenant ID</th>
                                        <th>Name</th>
                                        <th>Contact</th>
                                        <th>Email</th>
                                        <th>Room</th>
                                        <th>Check-in</th>
                                        <th>Check-out</th>
                                        <th>Payment Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tenants.map(tenant => (
                                        <tr key={tenant.TenantID}>
                                            <td className="tenant-id">{tenant.TenantID}</td>
                                            <td>{[tenant.FirstName, tenant.MiddleName, tenant.LastName].filter(Boolean).join(' ')}</td>
                                            <td>{tenant.Contact}</td>
                                            <td>{tenant.Email}</td>
                                            <td>{tenant.RoomID}</td>
                                            <td>{new Date(tenant.CheckInDate).toLocaleDateString()}</td>
                                            <td>{tenant.CheckOutDate ? new Date(tenant.CheckOutDate).toLocaleDateString() : 'N/A'}</td>
                                            <td>{tenant.PaymentStatus}</td>
                                            <td>
                                                <button onClick={() => handleEditTenantClick(tenant)}>Update</button>
                                                <button onClick={() => handleDeleteTenant(tenant.TenantID)} style={{ marginLeft: '8px' }}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'payments' && (
                    <div>
                        <h2>Payment Management</h2>
                        <div className="list-section">

                            <table>
                                <thead>
                                    <tr>
                                        <th>Tenant</th>
                                        <th>Amount</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map(payment => (
                                        <tr key={payment.PaymentID}>
                                            <td>{tenantDisplayName(tenants.find(t => t.TenantID === payment.TenantID))}</td>
                                            <td>${payment.Amount}</td>
                                            <td>{new Date(payment.Date).toLocaleDateString()}</td>
                                            <td>{payment.Status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'staff' && (
                    <div>
                        <h2>Staff Management</h2>
                        <div className="form-section">
                            <h3>Add/Edit Staff</h3>
                            <form onSubmit={handleStaffSubmit}>
                                <input
                                    type="text"
                                    placeholder="Name"
                                    value={staffForm.name}
                                    onChange={(e) => setStaffForm({...staffForm, name: e.target.value})}
                                />
                                <input
                                    type="text"
                                    placeholder="Role"
                                    value={staffForm.role}
                                    onChange={(e) => setStaffForm({...staffForm, role: e.target.value})}
                                />
                                <input
                                    type="text"
                                    placeholder="Contact"
                                    value={staffForm.contact}
                                    onChange={(e) => setStaffForm({...staffForm, contact: e.target.value})}
                                />
                                <select
                                    value={staffForm.AvailabilityStatus}
                                    onChange={(e) => setStaffForm({...staffForm, AvailabilityStatus: e.target.value})}
                                >
                                    <option value="">Select Availability</option>
                                    <option value="Available">Available</option>
                                    <option value="Busy">Busy</option>
                                    <option value="Off-Duty">Off-Duty</option>
                                </select>
                                <button type="submit">Add Staff</button>
                            </form>
                        </div>

                        <div className="list-section">
                            <h3>Staff List</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Role</th>
                                        <th>Contact</th>
                                        <th>Availability</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {staff.map(s => (
                                        <tr key={s.StaffID}>
                                            <td>{s.name}</td>
                                            <td>{s.role}</td>
                                            <td>{s.contact}</td>
                                            <td>{s.AvailabilityStatus}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'requests' && (
                    <div>
                        <h2>Service Requests</h2>
                        <div className="list-section">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Tenant</th>
                                        <th>Category</th>
                                        <th>Description</th>
                                        <th>Status</th>
                                        <th>Staff Assigned</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.map(request => {
                                        const tenant = tenants.find(t => t.TenantID === request.TenantID);
                                        const assignedStaff = staff.find(s => s.StaffID === request.StaffID);
                                        return (
                                            <tr key={request.RequestID}>
                                                <td>{tenant ? tenantDisplayName(tenant) : 'Unknown Tenant'}</td>
                                                <td>{request.Category}</td>
                                                <td>{request.Description}</td>
                                                <td>
                                                    <select
                                                        value={request.Status}
                                                        onChange={(e) => handleUpdateRequestStatus(
                                                            request.RequestID,
                                                            e.target.value,
                                                            request.StaffID
                                                        )}
                                                        className={`status-select ${request.Status.toLowerCase().replace(' ', '-')}`}
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="In Progress">In Progress</option>
                                                        <option value="Completed">Completed</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    <select
                                                        value={request.StaffID || ''}
                                                        onChange={(e) => handleUpdateRequestStatus(
                                                            request.RequestID,
                                                            request.Status,
                                                            e.target.value
                                                        )}
                                                    >
                                                        <option value="">Select Staff</option>
                                                        {staff
                                                            .filter(s => s.AvailabilityStatus === 'Available')
                                                            .map(s => (
                                                                <option key={s.StaffID} value={s.StaffID}>
                                                                    {s.name} ({s.role})
                                                                </option>
                                                            ))
                                                        }
                                                    </select>
                                                    {assignedStaff && (
                                                        <div className="staff-info">
                                                            <small>Contact: {assignedStaff.contact}</small>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                


                {activeTab === 'feedback' && (
                    <div>
                        <h2>Tenant Feedback</h2>
                        <div className="list-section">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Tenant</th>
                                        <th>Category</th>
                                        <th>Message</th>
                                        <th>Rating</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {feedback.map(f => (
                                        <tr key={f.FeedbackID}>
                                            <td>{tenantDisplayName(tenants.find(t => t.TenantID === f.TenantID))}</td>
                                            <td>{f.Category}</td>
                                            <td>{f.Message}</td>
                                            <td>{f.Rating}/5</td>
                                            <td>{new Date(f.DateSubmitted).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}