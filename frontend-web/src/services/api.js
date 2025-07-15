

// src/services/api.js

const API = 'http://blougecorp.local/api';

// ———————————————————————————————————————————————
// DESTINATIONS
// ———————————————————————————————————————————————

export const fetchDestinations = async (groupId) => {
  const url = groupId
    ? `${API}/destinations/${groupId}`
    : `${API}/destinations`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  if (!res.ok) throw new Error('Erreur lors de la récupération des destinations');
  return res.json();
};

export const createDestination = async (payload) => {
  const res = await fetch(`${API}/destinations/create`, {
    method : 'POST',
    headers: {
      'Content-Type' : 'application/json',
      Authorization  : `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const { error = 'Erreur inconnue' } = await res.json();
    throw new Error(error);
  }
  return res.json();          // ← renvoie la destination créée (JSON décodé)
};

// ———————————————————————————————————————————————
// GROUPES
// ———————————————————————————————————————————————

export async function fetchGroups() {
  const res = await fetch(`${API}/groups`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!res.ok) throw new Error('Erreur lors de la récupération des groupes');
  return res.json();
}

export async function createGroup(payload) {
  const res = await fetch(`${API}/groups/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Erreur lors de la création du groupe');
  }
  return res.json();
}

export async function deleteGroup(id) {
  const res = await fetch(`${API}/groups/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
  });

  const raw = await res.text();
  if (!res.ok) {
    try {
      const errorData = JSON.parse(raw);
      throw new Error(errorData.error || 'Erreur lors de la suppression');
    } catch {
      throw new Error('Erreur inconnue : réponse non JSON');
    }
  }

  try {
    return raw ? JSON.parse(raw) : { message: 'Suppression réussie (vide)' };
  } catch {
    return { message: 'Suppression réussie (non JSON)' };
  }
}

// ———————————————————————————————————————————————
// AUTHENTIFICATION
// ———————————————————————————————————————————————

export async function login(email, password) {
  const res = await fetch(`${API}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || 'Erreur lors de la connexion');
  }

  return res.json(); // { user, token }
}

export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};
