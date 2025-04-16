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
