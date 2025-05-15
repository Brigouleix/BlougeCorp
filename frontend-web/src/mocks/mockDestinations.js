import bretagne from '../assets/bretagne.jpg';
import toscane from '../assets/toscane.jpg';
import miami from '../assets/miami.jpg';
import ny from '../assets/ny.jpg';
import sainttropez from '../assets/sainttropez.jpg';
import crete from '../assets/crete.jpg';

export const mockDestinations = [
    {
        id: 1,
        name: "Bretagne",
        image: bretagne,
        location: { lat: 48.1173, lng: -1.6778 },
        members: ["Alice", "Bob", "Charlie", "David", "Eva", "Frank", "Theo", "Louis", "Chloe"],
        price: 350,
        dates: "du 12 au 20 mai",
        proposedBy: "Alice",
        comments: [{ rating: "4" }, { rating: "5" }]
    },
    {
        id: 2,
        name: "Toscane",
        image: toscane,
        location: { lat: 43.7696, lng: 11.2558 },
        members: ["Jean", "Marie", "Claire", "Paul", "Julie"],
        price: 420,
        dates: "du 1er au 10 juin",
        proposedBy: "Jean",
        comments: [{ rating: "5" }]
    },
    {
        id: 3,
        name: "Miami",
        image: miami,
        location: { lat: 25.7617, lng: -80.1918 },
        members: ["Max", "Léa", "Emma", "Nina"],
        price: 950,
        dates: "du 15 au 25 juillet",
        proposedBy: "Max",
        comments: [{ rating: "4" }, { rating: "3" }, { rating: "5" }]
    },
    {
        id: 4,
        name: "New-York",
        image: ny,
        location: { lat: 40.7128, lng: -74.0060 },
        members: ["Zack", "Nora", "Sam", "Ali", "Ivy", "Noah", "Sophie", "Tom"],
        price: 1200,
        dates: "du 2 au 12 août",
        proposedBy: "Nora",
        comments: []
    },
    {
        id: 5,
        name: "Saint-Tropez",
        image: sainttropez,
        location: { lat: 43.2694, lng: 6.6397 },
        members: ["Yasmine", "Hugo"],
        price: 600,
        dates: "du 5 au 15 juillet",
        proposedBy: "Yasmine",
        comments: [{ rating: "4" }]
    },
    {
        id: 6,
        name: "Crète",
        image: crete,
        location: { lat: 35.2401, lng: 24.8093 },
        members: ["Milo", "Sarah", "Ines"],
        price: 750,
        dates: "du 18 au 30 juin",
        proposedBy: "Sarah",
        comments: [{ rating: "5" }, { rating: "5" }]
    }
];

export const fetchDestinations = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(mockDestinations);
        }, 500);
    });
};

export const fetchDestinationsById = (id) => {
    return new Promise((resolve) => {
        const group = mockDestinations.find((g) => g.id === parseInt(id));
        resolve(group);
    });
};

