import { useState, useRef } from 'react';
import '../styles/CreateDestination.css';

export default function CreateDestination({ onClose = () => {}, members = [], groupId }) {
    const [name, setName] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [priceHouse, setPriceHouse] = useState('');
    const [priceTravel, setPriceTravel] = useState('');
    const [dates, setDates] = useState('');
    const [proposedBy, setProposedBy] = useState('');
    const [location, setLocation] = useState(null);

    // Nominatim autocomplete
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const searchTimeout = useRef(null);

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

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        if (query.length < 3) {
            setSuggestions([]);
            return;
        }

        searchTimeout.current = setTimeout(async () => {
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
                    { headers: { 'Accept-Language': 'fr' } }
                );
                const data = await res.json();
                setSuggestions(data);
            } catch (err) {
                console.error('Nominatim error:', err);
            }
        }, 400);
    };

    const handleSuggestionClick = (suggestion) => {
        setLocation({
            lat: parseFloat(suggestion.lat),
            lng: parseFloat(suggestion.lon),
            address: suggestion.display_name
        });
        setSearchQuery(suggestion.display_name);
        setSuggestions([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newDestination = {
            groupId,
            name,
            image,
            priceHouse,
            priceTravel,
            dates,
            proposedBy,
            members,
            location
        };

        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/destinations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newDestination),
            });

            if (!res.ok) {
                throw new Error(`Erreur HTTP : ${res.status}`);
            }

            const result = await res.json();
            console.log('Destination créée :', result);
            onClose();
        } catch (error) {
            console.error('Erreur lors de la création de la destination :', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="destination-form">
            <h2>Créer une destination</h2>

            <label>Nom</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />

            <label>Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {imagePreview && <img src={imagePreview} alt="Preview" style={{ width: '50%', borderRadius: '8px' }} />}

            <label>Prix logement</label>
            <input type="number" value={priceHouse} onChange={(e) => setPriceHouse(Number(e.target.value))} required />

            <label>Prix transport</label>
            <input type="number" value={priceTravel} onChange={(e) => setPriceTravel(Number(e.target.value))} required />

            <label>Dates</label>
            <input type="text" value={dates} onChange={(e) => setDates(e.target.value)} required />

            <label>Proposé par</label>
            <select value={proposedBy} onChange={(e) => setProposedBy(e.target.value)} required>
                <option value="">Sélectionner un membre</option>
                {members.map((member, index) => (
                    <option key={index} value={member}>{member}</option>
                ))}
            </select>

            <label>Lieu</label>
            <div style={{ position: 'relative' }}>
                <input
                    type="text"
                    placeholder="Tapez une adresse ou ville..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    required
                />
                {suggestions.length > 0 && (
                    <ul style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '0 0 8px 8px',
                        listStyle: 'none',
                        margin: 0,
                        padding: 0,
                        zIndex: 1000,
                        maxHeight: '200px',
                        overflowY: 'auto',
                    }}>
                        {suggestions.map((s, i) => (
                            <li
                                key={i}
                                onClick={() => handleSuggestionClick(s)}
                                style={{
                                    padding: '8px 12px',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid #eee',
                                    fontSize: '14px',
                                }}
                                onMouseEnter={(e) => e.target.style.background = '#f0f0f0'}
                                onMouseLeave={(e) => e.target.style.background = 'white'}
                            >
                                {s.display_name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <button type="submit" className="create-button">Créer</button>
        </form>
    );
}
