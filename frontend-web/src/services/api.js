// src/services/api.js

const API = process.env.REACT_APP_API_URL;

function authHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
    };
}

// ===== AUTH =====

export async function login(email, password) {
    try {
        const response = await fetch(`${API}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erreur lors de la connexion');
        }

        const data = await response.json();
        return data.user;
    } catch (error) {
        console.error('Erreur login API:', error);
        throw error;
    }
}

export const getCurrentUser = () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
};

// ===== GROUPS =====

export const fetchGroups = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API}/api/groups`, {
        headers: { Authorization: 'Bearer ' + token }
    });

    if (!response.ok) {
        const txt = await response.text();
        throw new Error(`${response.status} ${txt}`);
    }

    const groups = await response.json();

    return groups.map(g => ({
        ...g,
        members: Array.isArray(g.members)
            ? g.members
            : JSON.parse(g.members ?? '[]')
    }));
};

export async function deleteGroup(id) {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API}/api/groups/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erreur lors de la suppression');
    }

    return await response.json();
}

// ===== DESTINATIONS =====

export const fetchDestinations = async (groupId) => {
    const url = groupId ? `${API}/api/destinations?group_id=${groupId}` : `${API}/api/destinations`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Erreur lors du chargement des destinations');
    }
    return await response.json();
};

export const fetchDestinationById = async (id) => {
    const response = await fetch(`${API}/api/destinations/${id}`);
    if (!response.ok) {
        throw new Error('Destination introuvable');
    }
    return await response.json();
};

export async function deleteDestination(id) {
    const response = await fetch(`${API}/api/destinations/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
    });
    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la suppression');
    }
    return await response.json();
}

export async function createDestination(formData) {
    const response = await fetch(`${API}/api/destinations`, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) throw new Error('Échec de la création');
    return await response.json();
}

// ===== COMMENTS =====

export async function fetchComments(destId) {
    const response = await fetch(`${API}/api/destinations/${destId}/comments`);
    if (!response.ok) throw new Error('Erreur lors du chargement des commentaires');
    return await response.json();
}

export async function createComment(destId, text, rating) {
    const response = await fetch(`${API}/api/destinations/${destId}/comments`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ text, rating })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erreur');
    return data;
}

export async function deleteComment(commentId) {
    const response = await fetch(`${API}/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: authHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erreur');
    return data;
}

// ===== INVITATIONS =====

export async function fetchInvitations() {
    const response = await fetch(`${API}/api/invitations`, {
        headers: authHeaders()
    });
    if (!response.ok) throw new Error('Erreur lors du chargement des invitations');
    return await response.json();
}

export async function acceptInvitation(id) {
    const response = await fetch(`${API}/api/invitations/${id}/accept`, {
        method: 'POST',
        headers: authHeaders()
    });
    if (!response.ok) throw new Error("Erreur lors de l'acceptation");
    return await response.json();
}

export async function declineInvitation(id) {
    const response = await fetch(`${API}/api/invitations/${id}/decline`, {
        method: 'POST',
        headers: authHeaders()
    });
    if (!response.ok) throw new Error('Erreur lors du refus');
    return await response.json();
}

export async function sendInvitations(groupId, emails) {
    const response = await fetch(`${API}/api/invitations/send`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ groupId, emails })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Erreur lors de l'envoi");
    return data;
}

// ===== ACCOUNT =====

export async function changePassword(oldPassword, newPassword) {
    const response = await fetch(`${API}/api/account/password`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ oldPassword, newPassword })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erreur');
    return data;
}

export async function deleteAccount(password) {
    const response = await fetch(`${API}/api/account`, {
        method: 'DELETE',
        headers: authHeaders(),
        body: JSON.stringify({ password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erreur');
    return data;
}
