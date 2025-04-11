import bretagne from '../assets/bretagne.jpg';
import toscane from '../assets/toscane.jpg';
import miami from '../assets/miami.jpg';
import ny from '../assets/ny.jpg';
import sainttropez from '../assets/sainttropez.jpg';
import crete from '../assets/crete.jpg';

const mockGroups = [
    {
        id: 1,
        name: "Bretagne",
        image: bretagne,
        members: ["Alice", "Bob", "Charlie", "David", "Eva", "Frank"]
    },
    {
        id: 2,
        name: "Toscane",
        image: toscane,
        members: ["Jean", "Marie", "Luc", "Claire", "Paul", "Julie"]
    },
    {
        id: 3,
        name: "Miami",
        image: miami,
        members: ["Max", "Léa", "Sophie", "Tom", "Emma", "Nina"]
    },
    {
        id: 4,
        name: "New-York",
        image: ny,
        members: ["Zack", "Nora", "Sam", "Ali", "Ivy", "Noah"]
    },
    {
        id: 5,
        name: "Saint-Tropez",
        image: sainttropez,
        members: ["Yasmine", "Hugo", "Clara", "Leo", "Lina", "Alex"]
    },
    {
        id: 6,
        name: "Crète",
        image: crete,
        members: ["Milo", "Sarah", "Theo", "Ines", "Louis", "Chloe"]
    },
];

export const fetchGroups = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(mockGroups);
        }, 500);
    });
};
