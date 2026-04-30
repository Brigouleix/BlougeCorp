// src/services/api.js
// Toutes les fonctions API — aucun mock

const API = process.env.REACT_APP_API_URL;

function authHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

// ===================== AUTH =====================

export async function login(email, password) {
    const response = await fetch(`${API}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Erreur lors de la connexion');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data.user;
}

export const getCurrentUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

export async function forgotPassword(email) {
    const response = await fetch(`${API}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erreur');
    return data;
}

export async function resetPassword(token, password) {
    const response = await fetch(`${API}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erreur');
    return data;
}

// ===================== GROUPS =====================

export const fetchGroups = async () => {
    const response = await fetch(`${API}/api/groups`, {
        headers: authHeaders(),
    });

    if (!response.ok) {
        const txt = await response.text();
        throw new Error(`${response.status} ${txt}`);
    }

    const groups = await response.json();
    return groups.map(g => ({
        ...g,
        members: Array.isArray(g.members) ? g.members : JSON.parse(g.members ?? '[]'),
    }));
};

export async function deleteGroup(id) {
    const response = await fetch(`${API}/api/groups/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Erreur lors de la suppression');
    }

    return await response.json();
}

// ===================== DESTINATIONS =====================

export const fetchDestinations = async (groupId) => {
    let url = `${API}/api/destinations`;
    if (groupId) url += `?group_id=${groupId}`;

    const response = await fetch(url, {
        headers: authHeaders(),
    });

    if (!response.ok) throw new Error('Erreur chargement destinations');
    return await response.json();
};

export const fetchDestinationById = async (id) => {
    const response = await fetch(`${API}/api/destinations/${id}`, {
        headers: authHeaders(),
    });

    if (!response.ok) throw new Error('Destination introuvable');
    return await response.json();
};

export async function createDestination(data) {
    const response = await fetch(`${API}/api/destinations`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Échec de la création');
    return await response.json();
}

export async function archiveDestination(id) {
    const response = await fetch(`${API}/api/destinations/${id}/archive`, {
        method: 'PATCH',
        headers: authHeaders(),
    });

    if (!response.ok) throw new Error('Erreur archivage destination');
    return await response.json();
}

export async function deleteDestination(id) {
    const response = await fetch(`${API}/api/destinations/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });

    if (!response.ok) throw new Error('Erreur suppression destination');
    return await response.json();
}

export const fetchArchivedDestinations = async (groupId) => {
    let url = `${API}/api/destinations?archived=1`;
    if (groupId) url += `&group_id=${groupId}`;

    const response = await fetch(url, { headers: authHeaders() });
    if (!response.ok) throw new Error('Erreur chargement archives');
    return await response.json();
};

// ===================== COMMENTS =====================

export const fetchComments = async (destId) => {
    const response = await fetch(`${API}/api/destinations/${destId}/comments`);
    if (!response.ok) throw new Error('Erreur chargement commentaires');
    return await response.json();
};

export async function createComment(destId, text, rating) {
    const response = await fetch(`${API}/api/destinations/${destId}/comments`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ text, rating }),
    });

    if (!response.ok) throw new Error('Erreur ajout commentaire');
    return await response.json();
}

export async function deleteComment(commentId) {
    const response = await fetch(`${API}/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });

    if (!response.ok) throw new Error('Erreur suppression commentaire');
    return await response.json();
}

// ===================== INVITATIONS =====================

export const fetchInvitations = async () => {
    const response = await fetch(`${API}/api/invitations`, {
        headers: authHeaders(),
    });

    if (!response.ok) throw new Error('Erreur chargement invitations');
    return await response.json();
};

export async function acceptInvitation(id) {
    const response = await fetch(`${API}/api/invitations/${id}/accept`, {
        method: 'POST',
        headers: authHeaders(),
    });

    if (!response.ok) throw new Error('Erreur acceptation invitation');
    return await response.json();
}

export async function declineInvitation(id) {
    const response = await fetch(`${API}/api/invitations/${id}/decline`, {
        method: 'POST',
        headers: authHeaders(),
    });

    if (!response.ok) throw new Error('Erreur refus invitation');
    return await response.json();
}

export async function sendInvitations(groupId, emails) {
    const response = await fetch(`${API}/api/invitations/send`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ groupId, emails }),
    });

    if (!response.ok) throw new Error('Erreur envoi invitations');
    return await response.json();
}

// ===================== PHOTOS =====================

export const fetchPhotos = async (groupId) => {
    const response = await fetch(`${API}/api/groups/${groupId}/photos`, {
        headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Erreur chargement photos');
    return await response.json();
};

export async function uploadPhoto(groupId, image, caption = '') {
    const response = await fetch(`${API}/api/groups/${groupId}/photos`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ image, caption }),
    });
    if (!response.ok) throw new Error('Erreur upload photo');
    return await response.json();
}

export async function deletePhoto(photoId) {
    const response = await fetch(`${API}/api/photos/${photoId}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Erreur suppression photo');
    return await response.json();
}

// ===================== ROAD TRIPS =====================

export async function fetchRoadTrips(groupId) {
    const response = await fetch(`${API}/api/groups/${groupId}/roadtrips`, {
        headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Erreur chargement road trips');
    return await response.json();
}

export async function createRoadTrip(groupId, destinationIds) {
    const response = await fetch(`${API}/api/groups/${groupId}/roadtrips`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ destination_ids: destinationIds }),
    });
    if (!response.ok) throw new Error('Erreur création road trip');
    return await response.json();
}

export async function deleteRoadTrip(id) {
    const response = await fetch(`${API}/api/roadtrips/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Erreur suppression road trip');
    return await response.json();
}

// ===================== DESTINATIONS (UPDATE) =====================

export async function updateDestination(id, data) {
    const response = await fetch(`${API}/api/destinations/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Erreur mise à jour destination');
    return await response.json();
}

// ===================== ADMIN =====================

export async function fetchAdminStats() {
    const response = await fetch(`${API}/api/admin/stats`, { headers: authHeaders() });
    if (!response.ok) throw new Error('Accès refusé');
    return await response.json();
}

export async function fetchAdminUsers() {
    const response = await fetch(`${API}/api/admin/users`, { headers: authHeaders() });
    if (!response.ok) throw new Error('Accès refusé');
    return await response.json();
}

export async function adminDeleteUser(id) {
    const response = await fetch(`${API}/api/admin/users/${id}`, { method: 'DELETE', headers: authHeaders() });
    if (!response.ok) throw new Error('Erreur suppression');
    return await response.json();
}

export async function fetchAdminGroups() {
    const response = await fetch(`${API}/api/admin/groups`, { headers: authHeaders() });
    if (!response.ok) throw new Error('Accès refusé');
    return await response.json();
}

export async function adminDeleteGroup(id) {
    const response = await fetch(`${API}/api/admin/groups/${id}`, { method: 'DELETE', headers: authHeaders() });
    if (!response.ok) throw new Error('Erreur suppression');
    return await response.json();
}

export async function fetchAdminDestinations() {
    const response = await fetch(`${API}/api/admin/destinations`, { headers: authHeaders() });
    if (!response.ok) throw new Error('Accès refusé');
    return await response.json();
}

export async function adminDeleteDestination(id) {
    const response = await fetch(`${API}/api/admin/destinations/${id}`, { method: 'DELETE', headers: authHeaders() });
    if (!response.ok) throw new Error('Erreur suppression');
    return await response.json();
}

export async function adminTestEmail() {
    const response = await fetch(`${API}/api/admin/test-email`, { method: 'POST', headers: authHeaders() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Échec test email');
    return data;
}

// ===================== ACCOUNT =====================

export async function changePassword(oldPassword, newPassword) {
    const response = await fetch(`${API}/api/account/password`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ oldPassword, newPassword }),
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Erreur changement mot de passe');
    }

    return await response.json();
}

export async function deleteAccount(password) {
    const response = await fetch(`${API}/api/account`, {
        method: 'DELETE',
        headers: authHeaders(),
        body: JSON.stringify({ password }),
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Erreur suppression compte');
    }

    return await response.json();
}
