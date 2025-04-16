import { useState } from 'react';
import '../styles/CreateDestination.css'; 

export default function CreateDestination({ onClose }) {
    const [name, setName] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [price, setPrice] = useState('');
    const [dates, setDates] = useState('');
    const [proposedBy, setProposedBy] = useState('');

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newDestination = {
            id: Date.now(), // simple ID
            name,
            image,
            price,
            dates,
            proposedBy,
            members: [],
            comments: [],
        };

        const stored = localStorage.getItem('destinations');
        const destinations = stored ? JSON.parse(stored) : [];
        const updated = [...destinations, newDestination];
        localStorage.setItem('destinations', JSON.stringify(updated));

        onClose(); // Ferme le modal
    };

    return (
        <form onSubmit={handleSubmit} className="destination-form">
            
            <h2>Créer une destination</h2>

            <label>Nom</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />

            <label>Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange} required />
            {imagePreview && <img src={imagePreview} alt="Preview" style={{ width: '50%', margin: 'auto', borderRadius: '8px' }} />}

            <label>Prix</label>
            <input type="text" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Ex: 250 €" required />

            <label>Dates</label>
            <input type="text" value={dates} onChange={(e) => setDates(e.target.value)} placeholder="Ex: du 12 au 20 mai" required />

            <label>Proposé par</label>
            <input type="text" value={proposedBy} onChange={(e) => setProposedBy(e.target.value)} placeholder="Ex: Jules" required />

            <button type="submit" className="create-button">Créer</button>
        </form>
    );
}
