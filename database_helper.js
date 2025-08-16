// database-helper.js - NEW FILE - Create this file
import { database, auth } from './firebase-config.js';
import { ref, set, get, push, remove, update, onValue, off } from 'firebase/database';

// Get current user ID
export function getCurrentUserId() {
    const user = auth.currentUser;
    return user ? user.uid : null;
}

// ============================================
// USER PROFILE FUNCTIONS
// ============================================

export async function saveUserProfile(userProfile) {
    const userId = getCurrentUserId();
    if (!userId) return false;

    try {
        const userRef = ref(database, `users/${userId}`);
        await set(userRef, {
            ...userProfile,
            lastUpdated: Date.now()
        });
        return true;
    } catch (error) {
        console.error('Error saving user profile:', error);
        return false;
    }
}

export async function getUserProfile() {
    const userId = getCurrentUserId();
    if (!userId) return null;

    try {
        const userRef = ref(database, `users/${userId}`);
        const snapshot = await get(userRef);
        return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
        console.error('Error getting user profile:', error);
        return null;
    }
}

// ============================================
// VEHICLE FUNCTIONS
// ============================================

export async function saveVehicle(vehicleData) {
    const userId = getCurrentUserId();
    if (!userId) return false;

    try {
        const vehicleRef = ref(database, `vehicles/${userId}`);
        const newVehicleRef = push(vehicleRef);
        
        const vehicle = {
            ...vehicleData,
            id: newVehicleRef.key,
            ownerId: userId,
            createdAt: Date.now(),
            status: 'ACTIVE'
        };

        await set(newVehicleRef, vehicle);
        return vehicle;
    } catch (error) {
        console.error('Error saving vehicle:', error);
        return false;
    }
}

export async function getUserVehicles() {
    const userId = getCurrentUserId();
    if (!userId) return [];

    try {
        const vehiclesRef = ref(database, `vehicles/${userId}`);
        const snapshot = await get(vehiclesRef);
        
        if (snapshot.exists()) {
            const vehiclesData = snapshot.val();
            return Object.values(vehiclesData);
        }
        return [];
    } catch (error) {
        console.error('Error getting vehicles:', error);
        return [];
    }
}

export async function deleteVehicle(vehicleId) {
    const userId = getCurrentUserId();
    if (!userId) return false;

    try {
        const vehicleRef = ref(database, `vehicles/${userId}/${vehicleId}`);
        await remove(vehicleRef);
        return true;
    } catch (error) {
        console.error('Error deleting vehicle:', error);
        return false;
    }
}

// ============================================
// STOLEN VEHICLE ALERT FUNCTIONS
// ============================================

export async function createStolenAlert(alertData) {
    const userId = getCurrentUserId();
    if (!userId) return false;

    try {
        const alertsRef = ref(database, 'stolenAlerts');
        const newAlertRef = push(alertsRef);
        
        const alert = {
            ...alertData,
            id: newAlertRef.key,
            reportedBy: userId,
            createdAt: Date.now(),
            status: 'ACTIVE',
            viewCount: 0,
            responsesCount: 0
        };

        await set(newAlertRef, alert);
        return alert;
    } catch (error) {
        console.error('Error creating stolen alert:', error);
        return false;
    }
}

export async function getActiveAlerts() {
    try {
        const alertsRef = ref(database, 'stolenAlerts');
        const snapshot = await get(alertsRef);
        
        if (snapshot.exists()) {
            const alertsData = snapshot.val();
            // Filter only active alerts
            return Object.values(alertsData).filter(alert => alert.status === 'ACTIVE');
        }
        return [];
    } catch (error) {
        console.error('Error getting active alerts:', error);
        return [];
    }
}

export async function getUserAlerts() {
    const userId = getCurrentUserId();
    if (!userId) return [];

    try {
        const alertsRef = ref(database, 'stolenAlerts');
        const snapshot = await get(alertsRef);
        
        if (snapshot.exists()) {
            const alertsData = snapshot.val();
            // Filter alerts created by current user
            return Object.values(alertsData).filter(alert => alert.reportedBy === userId);
        }
        return [];
    } catch (error) {
        console.error('Error getting user alerts:', error);
        return [];
    }
}

// ============================================
// SUBSCRIPTION FUNCTIONS
// ============================================

export async function saveSubscription(subscriptionData) {
    const userId = getCurrentUserId();
    if (!userId) return false;

    try {
        const subscriptionRef = ref(database, `subscriptions/${userId}`);
        await set(subscriptionRef, {
            ...subscriptionData,
            userId: userId,
            updatedAt: Date.now()
        });
        return true;
    } catch (error) {
        console.error('Error saving subscription:', error);
        return false;
    }
}

export async function getUserSubscription() {
    const userId = getCurrentUserId();
    if (!userId) return null;

    try {
        const subscriptionRef = ref(database, `subscriptions/${userId}`);
        const snapshot = await get(subscriptionRef);
        return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
        console.error('Error getting subscription:', error);
        return null;
    }
}

// ============================================
// REAL-TIME LISTENERS
// ============================================

export function listenToActiveAlerts(callback) {
    const alertsRef = ref(database, 'stolenAlerts');
    
    const listener = onValue(alertsRef, (snapshot) => {
        if (snapshot.exists()) {
            const alertsData = snapshot.val();
            const activeAlerts = Object.values(alertsData).filter(alert => alert.status === 'ACTIVE');
            callback(activeAlerts);
        } else {
            callback([]);
        }
    });

    // Return function to unsubscribe
    return () => off(alertsRef, 'value', listener);
}

export function listenToUserVehicles(callback) {
    const userId = getCurrentUserId();
    if (!userId) return () => {};

    const vehiclesRef = ref(database, `vehicles/${userId}`);
    
    const listener = onValue(vehiclesRef, (snapshot) => {
        if (snapshot.exists()) {
            const vehiclesData = snapshot.val();
            callback(Object.values(vehiclesData));
        } else {
            callback([]);
        }
    });

    // Return function to unsubscribe
    return () => off(vehiclesRef, 'value', listener);
}