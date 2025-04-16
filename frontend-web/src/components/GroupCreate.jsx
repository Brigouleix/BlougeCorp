import { useState } from 'react';

export default function CreateGroup({ onClose }) {
    const [name, setName] = useState('');
    const [image, setImage] = useState(null);
    const [description, setDescription] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const groupData = {
            name,
            image,
            description
        };
        console.log("Nouveau groupe :", groupData);
        onClose(); // ferme la modal après envoi
    };

    return (
        <form onSubmit={handleSubmit} className="create-group-form">
            <h2>Créer un nouveau groupe</h2>

            <label>Nom du groupe</label>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />

            <label>Image du groupe</label>
            <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
            />

            <label>Description</label>
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
            />

            <button type="submit">Créer</button>
        </form>
    );
}
