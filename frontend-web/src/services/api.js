import bretagne from '../assets/bretagne.jpg';
import toscane from '../assets/toscane.jpg';
import miami from '../assets/miami.jpg';
import ny from '../assets/ny.jpg';
import sainttropez from '../assets/sainttropez.jpg';
import crete from '../assets/crete.jpg';

const API = 'http://blougecorp.local/api';

// ———————————————————————————————————————————————
// DESTINATIONS
// ———————————————————————————————————————————————

const mockData = [
    {
        id: 1,
        name: "Bretagne",
        image: bretagne,
        members: ["Alice", "Bob", "Charlie", "David", "Eva", "Frank", "Theo", "Louis", "Chloe"]
    },
    {
        id: 2,
        name: "Toscane",
        image: toscane,
        members: ["Jean", "Marie", "Claire", "Paul", "Julie"]
    },
    {
        id: 3,
        name: "Miami",
        image: miami,
        members: ["Max", "Léa", "Emma", "Nina"]
    },
    {
        id: 4,
        name: "New-York",
        image: ny,
        members: ["Zack", "Nora", "Sam", "Ali", "Ivy", "Noah", "Sophie", "Tom"]
    },
    {
        id: 5,
        name: "Saint-Tropez",
        image: sainttropez,
        members: ["Yasmine", "Hugo"]
    },
    {
        id: 6,
        name: "Crète",
        image: crete,
        members: ["Milo", "Sarah", "Ines"]
    },
];

export const fetchDestinations = () => {
    return new Promise((resolve) => {
        const stored = localStorage.getItem('destinations');
        if (stored) {
            resolve(JSON.parse(stored));
        } else {
            localStorage.setItem('destinations', JSON.stringify(mockData));
            resolve(mockData);
        }
    });
};

export async function createDestination(formData) {
    const response = await fetch(`${API}/destinations`, {
        method: 'POST',
        body: formData
    });
    if (!response.ok) throw new Error('Échec de la création');
    return await response.json();
}

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

export async function deleteGroup(id) {
    const res = await fetch(`${API}/groups/${id}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
        },
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression');
    }
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
