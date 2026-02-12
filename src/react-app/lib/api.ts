const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
    private baseURL: string;

    constructor() {
        this.baseURL = API_BASE_URL;
    }

    getAuthToken() {
        return localStorage.getItem('authToken');
    }

    setAuthToken(token: string) {
        localStorage.setItem('authToken', token);
    }

    clearAuthToken() {
        localStorage.removeItem('authToken');
    }

    async request(endpoint: string, options: RequestInit = {}) {
        const token = this.getAuthToken();

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${this.baseURL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(error.error || error.message || 'Request failed');
        }

        return response.json();
    }

    // Auth
    async register(data: { email: string; password: string; firstName: string; lastName: string; businessName: string }) {
        const result = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        this.setAuthToken(result.token);
        return result;
    }

    async login(email: string, password: string) {
        const result = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        this.setAuthToken(result.token);
        return result;
    }

    logout() {
        this.clearAuthToken();
    }

    // Onboarding
    async getOnboardingStatus() {
        return this.request('/onboarding/status');
    }

    async completeOnboardingStep(step: number, data: any) {
        return this.request(`/onboarding/step${step}`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async activateWorkspace() {
        return this.request('/onboarding/activate', {
            method: 'POST',
        });
    }

    // Dashboard
    async getDashboardMetrics() {
        return this.request('/dashboard/metrics');
    }

    async getDashboardActivity() {
        return this.request('/dashboard/activity');
    }

    async getDashboardAlerts() {
        return this.request('/dashboard/alerts');
    }

    // Contacts
    async getContacts() {
        return this.request('/contacts');
    }

    async getContact(id: string) {
        return this.request(`/contacts/${id}`);
    }

    async updateContact(id: string, data: any) {
        return this.request(`/contacts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // Bookings
    async getBookings(params?: { status?: string; date?: string }) {
        const query = new URLSearchParams(params as any).toString();
        return this.request(`/bookings${query ? `?${query}` : ''}`);
    }

    async getBooking(id: string) {
        return this.request(`/bookings/${id}`);
    }

    async updateBookingStatus(id: string, status: string, staffNotes?: string) {
        return this.request(`/bookings/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status, staffNotes }),
        });
    }

    // Inbox
    async getConversations(status?: string) {
        const query = status ? `?status=${status}` : '';
        return this.request(`/inbox${query}`);
    }

    async getConversation(id: string) {
        return this.request(`/inbox/${id}`);
    }

    async sendMessage(conversationId: string, content: string, channel: string) {
        return this.request(`/inbox/${conversationId}/messages`, {
            method: 'POST',
            body: JSON.stringify({ content, channel }),
        });
    }

    // Forms
    async getFormTemplates() {
        return this.request('/forms/templates');
    }

    async createFormTemplate(data: any) {
        return this.request('/forms/templates', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getFormSubmissions(status?: string) {
        const query = status ? `?status=${status}` : '';
        return this.request(`/forms/submissions${query}`);
    }

    async getPublicForm(id: string) {
        return this.request(`/forms/public/${id}`);
    }

    async submitPublicForm(id: string, data: any) {
        return this.request(`/forms/submit/${id}`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Inventory
    async getInventory() {
        return this.request('/inventory');
    }

    async createInventoryItem(data: any) {
        return this.request('/inventory', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateInventoryQuantity(id: string, quantity: number, type: string, notes?: string) {
        return this.request(`/inventory/${id}/quantity`, {
            method: 'PATCH',
            body: JSON.stringify({ quantity, type, notes }),
        });
    }

    async getInventoryAlerts() {
        return this.request('/inventory/alerts');
    }

    // Staff
    async getStaff() {
        return this.request('/staff');
    }

    async inviteStaff(data: { email: string; firstName: string; lastName: string; permissions: any }) {
        return this.request('/staff/invite', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateStaffPermissions(userId: string, permissions: any) {
        return this.request(`/staff/${userId}/permissions`, {
            method: 'PATCH',
            body: JSON.stringify({ permissions }),
        });
    }
}

export const api = new ApiClient();
