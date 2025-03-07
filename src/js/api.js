// API utility functions
const API = {
  // Get base URL - adapts to development or production
  getBaseUrl() {
    // In production (like Vercel), use relative URLs
    if (window.location.hostname !== 'localhost' && 
        window.location.hostname !== '127.0.0.1') {
      return '';
    }
    // In development, use localhost with port
    return 'http://localhost:3000';
  },

  // Helper to build API URLs
  buildUrl(endpoint) {
    return `${this.getBaseUrl()}${endpoint}`;
  },

  // Standard fetch with auth headers
  async fetch(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    const response = await fetch(this.buildUrl(endpoint), {
      ...options,
      headers
    });

    return response;
  },

  // Common API methods
  async get(endpoint) {
    return this.fetch(endpoint);
  },

  async post(endpoint, data) {
    return this.fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async delete(endpoint) {
    return this.fetch(endpoint, {
      method: 'DELETE'
    });
  }
};