import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import './HomePage.css';

export default function HomePage() {
    const navigate = useNavigate();
    const [loginType, setLoginType] = useState('owner'); // 'owner' or 'tenant'
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            // In a real application, you would make an API call to verify credentials
            // For now, we'll use the sample data from the SQL file
            if (loginType === 'owner') {
                const response = await api.get('/Owner');
                const owners = response.data;
                const owner = owners.find(o => o.email === formData.email);
                
                if (owner) {
                    localStorage.setItem('userType', 'owner');
                    localStorage.setItem('userId', owner.OwnerID);
                    navigate('/owner-dashboard');
                } else {
                    setError('Invalid owner credentials');
                }
            } else {
                const response = await api.get('/Tenant');
                const tenants = response.data;
                const tenant = tenants.find(t => t.email === formData.email);
                
                if (tenant) {
                    localStorage.setItem('userType', 'tenant');
                    localStorage.setItem('userId', tenant.TenantID);
                    navigate('/tenant-dashboard');
                } else {
                    setError('Invalid tenant credentials');
                }
            }
        } catch (err) {
            setError('Error during login');
            console.error(err);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2 className="login-title">
                    Rental Management System
                </h2>
                
                <div className="toggle-buttons">
                    <button
                        onClick={() => setLoginType('owner')}
                        className={`toggle-button ${loginType === 'owner' ? 'active' : ''}`}
                    >
                        Owner Login
                    </button>
                    <button
                        onClick={() => setLoginType('tenant')}
                        className={`toggle-button ${loginType === 'tenant' ? 'active' : ''}`}
                    >
                        Tenant Login
                    </button>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            placeholder="Email address"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <button type="submit" className="submit-button">
                        Sign in
                    </button>
                </form>
            </div>
        </div>
    );
}