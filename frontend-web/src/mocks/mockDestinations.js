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

const mockDestinations = [
    {
        id: 1,
        name: "Bretagne",
        image: bretagne,
        location: { lat: 48.1173, lng: -1.6778 }, // Rennes, Bretagne (France)
        members: ["Alice", "Bob", "Charlie", "David", "Eva", "Frank", "Theo", "Louis", "Chloe"]
    },
    {
        id: 2,
        name: "Toscane",
        image: toscane,
        location: { lat: 43.7696, lng: 11.2558 }, // Florence, Toscane (Italie)
        members: ["Jean", "Marie", "Claire", "Paul", "Julie"]
    },
    {
        id: 3,
        name: "Miami",
        image: miami,
        location: { lat: 25.7617, lng: -80.1918 }, // Miami, Floride (États-Unis)
        members: ["Max", "Léa", "Emma", "Nina"]
    },
    {
        id: 4,
        name: "New-York",
        image: ny,
        location: { lat: 40.7128, lng: -74.0060 }, // New York City (États-Unis)
        members: ["Zack", "Nora", "Sam", "Ali", "Ivy", "Noah", "Sophie", "Tom"]
    },
    {
        id: 5,
        name: "Saint-Tropez",
        image: sainttropez,
        location: { lat: 43.2694, lng: 6.6397 }, // Saint-Tropez (France)
        members: ["Yasmine", "Hugo"]
    },
    {
        id: 6,
        name: "Crète",
        image: crete,
        location: { lat: 35.2401, lng: 24.8093 }, // Héraklion, Crète (Grèce)
        members: ["Milo", "Sarah", "Ines"]
    }
];

export const fetchDestinations = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(mockDestinations);
        }, 500);
    });
};


