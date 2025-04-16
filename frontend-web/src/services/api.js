// src/services/api.js
import bretagne from '../assets/bretagne.jpg';
import toscane from '../assets/toscane.jpg';
import miami from '../assets/miami.jpg';
import ny from '../assets/ny.jpg';
import sainttropez from '../assets/sainttropez.jpg';
import crete from '../assets/crete.jpg';


export const fetchDestinationsById = (id) => {
    return new Promise((resolve) => {
        const group = mockDestinations.find((g) => g.id === parseInt(id));
        resolve(group);
    });
};

export async function createDestination(formData) {
    const response = await fetch('/api/destinations', {
        method: 'POST',
        body: formData
    });

    if (!response.ok) throw new Error('Échec de la création');
    return await response.json(); // doit retourner la nouvelle destination
}

const mockDestinations = [
    {
        id: 1,
        name: "Bretagne",
        image: bretagne,
        members: ["Alice", "Bob", "Charlie", "David", "Eva", "Frank","Theo","Louis", "Chloe"]
    },
    {
        id: 2,
        name: "Toscane",
        image: toscane,
        members:  ["Jean", "Marie", "Claire", "Paul", "Julie"]
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
        members:["Zack", "Nora", "Sam", "Ali", "Ivy", "Noah",, "Sophie", "Tom"]
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
        members:  ["Milo", "Sarah",  "Ines", ]
    },
];

export const fetchDestinations = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(mockDestinations);
        }, 500);
    });
};

// 🔧 Simule des utilisateurs en base
const mockUsers = [
    { id: 1, email: 'alice@blouge.com', password: '1234', username: 'alice' },
    { id: 2, email: 'bob@blouge.com', password: '5678', username: 'bob' },
];

// 🔧 Simule des groupes
let mockGroups = [
    {
        id: 1,
        name: "Groupe A",
        members: ["alice", "bob", "charlie"],
        creator: "alice"
    },
    {
        id: 2,
        name: "Groupe B",
        members: ["bob", "david", "eve"],
        creator: "bob"
    }
];




// ✅ Simule une API de connexion
export const login = async (email, password) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const user = mockUsers.find(
                (u) => u.email === email && u.password === password
            );
            if (user) {
                // Tu peux aussi stocker l'utilisateur dans localStorage ici
                localStorage.setItem("user", JSON.stringify(user));
            }
            resolve(user);
        }, 500); // délai simulé
    });
};

// ✅ Récupère l'utilisateur connecté (depuis localStorage)
export const getCurrentUser = () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
};

// ✅ Récupère les groupes d’un utilisateur
export const getUserGroups = async (username) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const userGroups = mockGroups.filter(group =>
                group.members.includes(username)
            );
            resolve(userGroups);
        }, 500);
    });
};

// ✅ Crée un nouveau groupe
export const createGroup = async (groupName, creatorUsername) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newGroup = {
                id: mockGroups.length + 1,
                name: groupName,
                members: [creatorUsername],
                creator: creatorUsername,
            };
            mockGroups.push(newGroup);
            resolve(newGroup);
        }, 500);
    });
};



export const fetchGroupById = async (groupId) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const group = mockGroups.find(g => g.id === parseInt(groupId));
            resolve(group);
        }, 500);
    });
};


// Récupère tous les groupes
export const fetchGroups = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(mockGroups);
        }, 500); // délai simulé
    });
};

