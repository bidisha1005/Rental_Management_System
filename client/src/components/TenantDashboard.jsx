// src/TenantDashboard.jsx
import React, { useEffect, useState, useCallback } from 'react';
import './TenantDashboard.css';
import { useParams } from "react-router-dom";

function TenantDashboard() {
  const { tenantID } = useParams();
  const [data, setData] = useState({});
  const [feedbackForm, setFeedbackForm] = useState({ Category: "", Message: "", Rating: 5 });
  const [requestForm, setRequestForm] = useState({ Category: "", Description: "", StaffID: "" });
  const [paymentForm, setPaymentForm] = useState({ Amount: '', PaymentMode: 'Cash', Date: new Date().toISOString().split('T')[0] });
  const [totalDue, setTotalDue] = useState(0);

  // fetch total due when the dashboard loads
  const fetchTotalDue = useCallback(async () => {
  try {
    const res = await fetch(`http://localhost:5002/Tenant/${tenantID}/TotalDue`);
    if (!res.ok) throw new Error("Failed to fetch total due");
    const json = await res.json();
    setTotalDue(parseFloat(json.TotalDue) || 0);
  } catch (err) {
    console.error("fetchTotalDue error:", err);
  }
}, [tenantID]);

  // load tenant data (used on mount and after submitting forms)
  const loadTenantData = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:5002/Tenant/${tenantID}/all`);
      if (!res.ok) throw new Error('Failed to fetch tenant data');
      const json = await res.json();
      setData({
        tenant: json.tenant || {},
        payments: json.payments || [],
        requests: json.requests || [],
        feedbacks: json.feedbacks || []
      });
    } catch (err) {
      console.error("loadTenantData error:", err);
    }
  }, [tenantID]);

  useEffect(() => {
    if (tenantID) loadTenantData();
    fetchTotalDue();
  }, [tenantID, loadTenantData, fetchTotalDue]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        Category: feedbackForm.Category,
        Message: feedbackForm.Message,
        Rating: Number(feedbackForm.Rating),
        TenantID: Number(tenantID),
        Date: new Date().toISOString().split('T')[0]
      };

      const res = await fetch('http://localhost:5002/Feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to submit feedback');
      }

      setFeedbackForm({ Category: "", Message: "", Rating: 5 });
      await loadTenantData();
    } catch (err) {
      console.error("handleFeedbackSubmit error:", err);
      alert(err.message || "Unable to submit feedback");
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        Category: requestForm.Category,
        Description: requestForm.Description,
        TenantID: Number(tenantID),
        StaffID: requestForm.StaffID || null,
        Status: 'Open',
        DateRaised: new Date().toISOString().split('T')[0]
      };

      const res = await fetch('http://localhost:5002/ServiceRequest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to submit service request');
      }

      setRequestForm({ Category: "", Description: "", StaffID: "" });
      await loadTenantData();
    } catch (err) {
      console.error("handleRequestSubmit error:", err);
      alert(err.message || "Unable to submit service request");
    }
  }; 


  const handlePaymentSubmit = async (e) => {
  e.preventDefault();
  try {
    const payload = {
      TenantID: Number(tenantID),
      PaymentMode: paymentForm.PaymentMode
    };

    const res = await fetch("http://localhost:5002/Payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to submit payment");
    }

    const result = await res.json();
    alert(`Payment of $${result.amount} successful!`);

    // Refresh tenant data + total due
    await loadTenantData();
    await fetchTotalDue();

    // Reset payment form
    setPaymentForm({
      PaymentMode: "Cash",
      Date: new Date().toISOString().split("T")[0]
    });
  } catch (err) {
    console.error("handlePaymentSubmit error:", err);
    alert(err.message || "Unable to submit payment");
  }
};

  return (
    <div className="tenant-dashboard">
      <h2>Welcome, {data.tenant?.FullName || `${data.tenant?.FirstName || ''} ${data.tenant?.LastName || ''}`}</h2>

      {/* Tenant Info */}
      <section>
        <h3>Tenant Info</h3>
        <div className="contact-info">
          <p><strong>ID:</strong> {data.tenant?.TenantID}</p>
          <p><strong>Name:</strong> {data.tenant?.FullName || `${data.tenant?.FirstName || ''} ${data.tenant?.LastName || ''}`}</p>
          <p><strong>Email:</strong> {data.tenant?.Email}</p>
          <p><strong>Phone:</strong> {data.tenant?.Contact}</p>
          <p><strong>Check In:</strong> {new Date(data.tenant?.CheckInDate).toLocaleDateString()}</p>
          <p><strong>Check Out:</strong> {data.tenant?.CheckOutDate ? new Date(data.tenant?.CheckOutDate).toLocaleDateString() : 'N/A'}</p>
        </div>
      </section>

      {/* Payments */}
      <section>
        <h3>Payments</h3>
        <ul>
          {data.payments?.map((p) => (
            <li key={p.PaymentID}>
              <span className="amount">${p.Amount}</span>
              <span className={`status ${p.Status.toLowerCase()}`}>{p.Status}</span>
              <span>({p.PaymentMode})</span>
            </li>
          ))}
        </ul>
        <form onSubmit={handlePaymentSubmit} className="payment-form" style={{ marginTop: '12px' }}>
          <h4>Make a Payment</h4>

          <div style={{ marginBottom: '10px' }}>
            <strong>Total Due: </strong>
            <span style={{ color: '#1e40af', fontWeight: 'bold' }}>
              ${totalDue.toFixed(2)}
            </span>
          </div>

          <select
            value={paymentForm.PaymentMode}
            onChange={(e) => setPaymentForm({ ...paymentForm, PaymentMode: e.target.value })}
          >
            <option>Cash</option>
            <option>Card</option>
            <option>UPI</option>
            <option>Bank Transfer</option>
          </select>

          <input
            type="date"
            value={paymentForm.Date}
            onChange={(e) => setPaymentForm({ ...paymentForm, Date: e.target.value })}
            required
          />

          <button type="submit" disabled={totalDue <= 0}>
            {totalDue > 0 ? "Pay Now" : "Paid"}
          </button>
        </form>

      </section>

      {/* Service Requests */}
      <section>
        <h3>Service Requests</h3>
        <ul>
          {data.requests?.map((r) => (
            <li key={r.RequestID}>
              <div><strong>{r.Category}</strong></div>
              <div>{r.Description}</div>
              <span className={`status ${r.Status.toLowerCase().replace(' ', '-')}`}>{r.Status}</span>
            </li>
          ))}
        </ul>

        <form onSubmit={handleRequestSubmit} className="request-form">
          <h4>Raise Service Request</h4>
          <input
            type="text"
            placeholder="Category"
            value={requestForm.Category}
            onChange={(e) => setRequestForm({ ...requestForm, Category: e.target.value })}
            required
          />
          <textarea
            placeholder="Description"
            value={requestForm.Description}
            onChange={(e) => setRequestForm({ ...requestForm, Description: e.target.value })}
            required
          />
          <button type="submit">Submit Request</button>
        </form>
      </section>

      {/* Feedback */}
      <section>
        <h3>Feedback</h3>
        <ul>
          {data.feedbacks?.map((f) => (
            <li key={f.FeedbackID} className="feedback-item">
              <div>
                <div><strong>{f.Category}</strong></div>
                <div>{f.Message}</div>
              </div>
              <div className="rating">{'★'.repeat(f.Rating)}{'☆'.repeat(5-f.Rating)}</div>
            </li>
          ))}
        </ul>

        <form onSubmit={handleFeedbackSubmit} className="request-form">
          <h4>Add Feedback</h4>
          <input
            type="text"
            placeholder="Category"
            value={feedbackForm.Category}
            onChange={(e) => setFeedbackForm({ ...feedbackForm, Category: e.target.value })}
            required
          />
          <textarea
            placeholder="Message"
            value={feedbackForm.Message}
            onChange={(e) => setFeedbackForm({ ...feedbackForm, Message: e.target.value })}
            required
          />
          <div>
            <label>Rating: </label>
            <input
              type="number"
              placeholder="Rating"
              value={feedbackForm.Rating}
              min={1}
              max={5}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, Rating: e.target.value })}
              required
            />
            <span className="rating">{'★'.repeat(feedbackForm.Rating)}{'☆'.repeat(5-feedbackForm.Rating)}</span>
          </div>
          <button type="submit">Submit Feedback</button>
        </form>
      </section>
    </div>
  );
}

export default TenantDashboard;