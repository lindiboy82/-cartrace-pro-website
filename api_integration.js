// api_integration.js - CarTrace Pro API Integration Framework

/**
 * CarTrace Pro - Public API Integration Framework
 * Allows third-party services, insurance companies, and partners to integrate with CarTrace
 */

export class CarTraceAPI {
    constructor(config = {}) {
        this.apiKey = config.apiKey || null;
        this.baseURL = config.baseURL || 'https://api.cartracepro.com/v1';
        this.timeout = config.timeout || 30000;
        this.retryAttempts = config.retryAttempts || 3;
    }

    /**
     * Set API key for authenticated requests
     */
    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }

    /**
     * Make authenticated API request
     * @private
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
            ...options.headers
        };

        let attempt = 0;
        while (attempt < this.retryAttempts) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeout);

                const response = await fetch(url, {
                    ...options,
                    headers,
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`API Error: ${response.status} ${response.statusText}`);
                }

                return await response.json();
            } catch (error) {
                attempt++;
                if (attempt >= this.retryAttempts) {
                    throw error;
                }
                // Exponential backoff
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }
    }

    // ========================================
    // PUBLIC API ENDPOINTS
    // ========================================

    /**
     * Get active stolen vehicle alerts
     * @param {Object} filters - Optional filters
     * @returns {Promise<Array>} - Array of active alerts
     */
    async getActiveAlerts(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        return this.request(`/alerts/active?${queryParams}`, {
            method: 'GET'
        });
    }

    /**
     * Report a stolen vehicle (requires authentication)
     * @param {Object} vehicleData - Vehicle and theft information
     * @returns {Promise<Object>} - Created alert with ID
     */
    async reportStolenVehicle(vehicleData) {
        return this.request('/alerts', {
            method: 'POST',
            body: JSON.stringify(vehicleData)
        });
    }

    /**
     * Report a vehicle sighting
     * @param {string} alertId - ID of the stolen vehicle alert
     * @param {Object} sightingData - Location and details of sighting
     * @returns {Promise<Object>} - Sighting confirmation
     */
    async reportSighting(alertId, sightingData) {
        return this.request(`/alerts/${alertId}/sightings`, {
            method: 'POST',
            body: JSON.stringify(sightingData)
        });
    }

    /**
     * Get recovery statistics
     * @param {Object} filters - Optional filters (date range, location, etc.)
     * @returns {Promise<Object>} - Recovery statistics
     */
    async getStatistics(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        return this.request(`/statistics?${queryParams}`, {
            method: 'GET'
        });
    }

    /**
     * Verify a user's reporter status and badges
     * @param {string} userId - User ID to verify
     * @returns {Promise<Object>} - Verification status and badges
     */
    async verifyReporter(userId) {
        return this.request(`/users/${userId}/verify`, {
            method: 'GET'
        });
    }

    // ========================================
    // INSURANCE PARTNER ENDPOINTS
    // ========================================

    /**
     * Verify vehicle protection plan (for insurance partners)
     * @param {string} licensePlate - Vehicle license plate
     * @param {string} vin - Vehicle VIN
     * @returns {Promise<Object>} - Protection plan details
     */
    async verifyProtectionPlan(licensePlate, vin) {
        return this.request('/insurance/verify', {
            method: 'POST',
            body: JSON.stringify({ licensePlate, vin })
        });
    }

    /**
     * Get theft risk assessment for a vehicle
     * @param {Object} vehicleInfo - Vehicle details
     * @returns {Promise<Object>} - Risk assessment and recommendations
     */
    async getTheftRiskAssessment(vehicleInfo) {
        return this.request('/insurance/risk-assessment', {
            method: 'POST',
            body: JSON.stringify(vehicleInfo)
        });
    }

    /**
     * Create bulk protection plans (for fleet managers)
     * @param {Array} vehicles - Array of vehicle data
     * @returns {Promise<Object>} - Bulk creation results
     */
    async createBulkProtection(vehicles) {
        return this.request('/insurance/bulk-protection', {
            method: 'POST',
            body: JSON.stringify({ vehicles })
        });
    }

    // ========================================
    // WEBHOOK MANAGEMENT
    // ========================================

    /**
     * Register a webhook endpoint
     * @param {Object} webhookConfig - Webhook configuration
     * @returns {Promise<Object>} - Webhook registration confirmation
     */
    async registerWebhook(webhookConfig) {
        return this.request('/webhooks', {
            method: 'POST',
            body: JSON.stringify(webhookConfig)
        });
    }

    /**
     * Update webhook configuration
     * @param {string} webhookId - Webhook ID
     * @param {Object} updates - Configuration updates
     * @returns {Promise<Object>} - Updated webhook config
     */
    async updateWebhook(webhookId, updates) {
        return this.request(`/webhooks/${webhookId}`, {
            method: 'PATCH',
            body: JSON.stringify(updates)
        });
    }

    /**
     * Delete webhook
     * @param {string} webhookId - Webhook ID to delete
     * @returns {Promise<Object>} - Deletion confirmation
     */
    async deleteWebhook(webhookId) {
        return this.request(`/webhooks/${webhookId}`, {
            method: 'DELETE'
        });
    }

    // ========================================
    // GEOFENCING ALERTS
    // ========================================

    /**
     * Create geofence for vehicle
     * @param {string} vehicleId - Vehicle ID
     * @param {Object} geofenceData - Geofence coordinates and settings
     * @returns {Promise<Object>} - Created geofence
     */
    async createGeofence(vehicleId, geofenceData) {
        return this.request(`/vehicles/${vehicleId}/geofence`, {
            method: 'POST',
            body: JSON.stringify(geofenceData)
        });
    }

    /**
     * Update geofence settings
     * @param {string} vehicleId - Vehicle ID
     * @param {string} geofenceId - Geofence ID
     * @param {Object} updates - Geofence updates
     * @returns {Promise<Object>} - Updated geofence
     */
    async updateGeofence(vehicleId, geofenceId, updates) {
        return this.request(`/vehicles/${vehicleId}/geofence/${geofenceId}`, {
            method: 'PATCH',
            body: JSON.stringify(updates)
        });
    }

    /**
     * Get geofence breach alerts
     * @param {string} vehicleId - Vehicle ID
     * @returns {Promise<Array>} - Geofence breach history
     */
    async getGeofenceBreaches(vehicleId) {
        return this.request(`/vehicles/${vehicleId}/geofence/breaches`, {
            method: 'GET'
        });
    }

    // ========================================
    // ANALYTICS
    // ========================================

    /**
     * Get heat map data for theft incidents
     * @param {Object} filters - Location and time filters
     * @returns {Promise<Object>} - Heat map data
     */
    async getTheftHeatMap(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        return this.request(`/analytics/heatmap?${queryParams}`, {
            method: 'GET'
        });
    }

    /**
     * Get response time analytics
     * @param {string} dateRange - Date range (e.g., '7d', '30d', '90d')
     * @returns {Promise<Object>} - Response time metrics
     */
    async getResponseTimeAnalytics(dateRange = '30d') {
        return this.request(`/analytics/response-time?range=${dateRange}`, {
            method: 'GET'
        });
    }

    /**
     * Get community engagement metrics
     * @returns {Promise<Object>} - Community statistics
     */
    async getCommunityMetrics() {
        return this.request('/analytics/community', {
            method: 'GET'
        });
    }
}

// ========================================
// WEBHOOK EVENT TYPES
// ========================================

export const WebhookEvents = {
    VEHICLE_STOLEN: 'vehicle.stolen',
    VEHICLE_SIGHTED: 'vehicle.sighted',
    VEHICLE_RECOVERED: 'vehicle.recovered',
    GEOFENCE_BREACH: 'geofence.breach',
    REWARD_PAID: 'reward.paid',
    USER_VERIFIED: 'user.verified'
};

// ========================================
// EXAMPLE USAGE
// ========================================

/*
// Initialize API client
const api = new CarTraceAPI({
    apiKey: 'your-api-key-here',
    baseURL: 'https://api.cartracepro.com/v1'
});

// Get active alerts
const alerts = await api.getActiveAlerts({
    state: 'FL',
    city: 'Naples',
    radius: 50 // miles
});

// Report stolen vehicle
const alert = await api.reportStolenVehicle({
    licensePlate: 'ABC1234',
    make: 'Honda',
    model: 'Civic',
    year: 2020,
    color: 'Silver',
    location: {
        address: '123 Main St, Naples, FL',
        coordinates: { lat: 26.1420, lng: -81.7948 }
    }
});

// Report sighting
const sighting = await api.reportSighting(alert.id, {
    location: {
        address: '456 Beach Blvd, Fort Myers, FL',
        coordinates: { lat: 26.6406, lng: -81.8723 }
    },
    photos: ['base64-encoded-image'],
    notes: 'Spotted at gas station'
});

// Get theft heat map
const heatmap = await api.getTheftHeatMap({
    state: 'FL',
    startDate: '2025-01-01',
    endDate: '2025-03-31'
});

// Create geofence
const geofence = await api.createGeofence('vehicle-id', {
    center: { lat: 26.1420, lng: -81.7948 },
    radius: 5, // miles
    alerts: {
        breach: true,
        exit: true,
        enter: false
    }
});

// Register webhook
const webhook = await api.registerWebhook({
    url: 'https://your-server.com/webhook',
    events: [
        WebhookEvents.VEHICLE_STOLEN,
        WebhookEvents.VEHICLE_SIGHTED,
        WebhookEvents.VEHICLE_RECOVERED
    ],
    secret: 'your-webhook-secret'
});
*/

export default CarTraceAPI;
