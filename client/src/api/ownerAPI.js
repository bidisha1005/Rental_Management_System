import api from './api';

// Properties API calls
export const getProperties = async (ownerId) => {
    try {
        const response = await api.get(`/Property?ownerId=${ownerId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const addProperty = async (propertyData) => {
    try {
        const response = await api.post('/Property', propertyData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteProperty = async (propertyId) => {
    try {
        await api.delete(`/Property/${propertyId}`);
    } catch (error) {
        throw error;
    }
};

// Rooms API calls
export const getRooms = async (propertyId) => {
    try {
        const response = await api.get(`/Room?propertyId=${propertyId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const addRoom = async (roomData) => {
    try {
        const response = await api.post('/Room', roomData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteRoom = async (roomId) => {
    try {
        await api.delete(`/Room/${roomId}`);
    } catch (error) {
        throw error;
    }
};

// Tenants API calls
export const getTenants = async () => {
    try {
        const response = await api.get('/Tenant');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const addTenant = async (tenantData) => {
    try {
        const response = await api.post('/Tenant', tenantData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateTenant = async (tenantId, tenantData) => {
    try {
        const response = await api.put(`/Tenant/${tenantId}`, tenantData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Payments API calls
export const getPayments = async () => {
    try {
        const response = await api.get('/Payment');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updatePaymentStatus = async (paymentId, status) => {
    try {
        const response = await api.put(`/Payment/${paymentId}`, { Status: status });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Staff API calls
export const getStaff = async () => {
    try {
        const response = await api.get('/Staff');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const addStaff = async (staffData) => {
    try {
        const response = await api.post('/Staff', staffData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateStaffAvailability = async (staffId, status) => {
    try {
        const response = await api.put(`/Staff/${staffId}`, { AvailabilityStatus: status });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Service Requests API calls
export const getServiceRequests = async () => {
    try {
        const response = await api.get('/ServiceRequest');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateServiceRequest = async (requestId, data) => {
    try {
        const response = await api.put(`/ServiceRequest/${requestId}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Feedback API calls
export const getFeedback = async () => {
    try {
        const response = await api.get('/Feedback');
        return response.data;
    } catch (error) {
        throw error;
    }
};