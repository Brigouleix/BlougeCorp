import { useState, useEffect, useRef } from 'react';
import { LoadScript, Autocomplete } from '@react-google-maps/api';
import myGroupsMock from '../mocks/myGroupsMock'; // ✅ Import des groupes mockés
import '../styles/CreateDestination.css';





export default function CreateDestination({ onClose = () => {} }) {
    const [name, setName] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [priceHouse, setPriceHouse] = useState(null);
    const [priceTravel, setPriceTravel] = useState(null);
    const [dates, setDates] = useState(null);
    const [proposedBy, setProposedBy] = useState(null);
    const [location, setLocation] = useState(null);
    const [members, setMembers] = useState([]);
    const autocompleteRef = useRef(null);

    useEffect(() => {
        // ✅ Extraire tous les membres uniques des groupes mockés
        const allMembers = myGroupsMock
            .flatMap(group => group.members)
            .filter((value, index, self) => self.indexOf(value) === index); // Supprime les doublons

        setMembers(allMembers);
    }, []);

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

    const handlePlaceChanged = () => {
        const place = autocompleteRef.current.getPlace();
        if (place && place.geometry) {
            const loc = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
                address: place.formatted_address
            };
            setLocation(loc);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
    
        const newDestination = {
            id: Date.now(),
            name,
            image,
            priceHouse: Number(priceHouse),   // ✅ conversion explicite
            priceTravel: Number(priceTravel), // ✅ conversion explicite
            dates,
            proposedBy,
            members: [],
            comments: [],
            location,
        };
    
        const stored = localStorage.getItem('destinations');
        const destinations = stored ? JSON.parse(stored) : [];
        const updated = [...destinations, newDestination];
        localStorage.setItem('destinations', JSON.stringify(updated));
        
        onClose();
    };
    

    return (
        <form onSubmit={handleSubmit} className="destination-form">
            <h2>Créer une destination</h2>

            <label>Nom</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />

            <label>Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {imagePreview && (
                <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ width: '50%', margin: 'auto', borderRadius: '8px' }}
                />
            )}

            <label>Prix logement</label>
            <input
                type="number"
                value={priceHouse}
                onChange={(e) => setPriceHouse(Number(e.target.value))}
                placeholder="Ex: 250 €"
                required
            />

            <label>Prix transport</label>
            <input
                type="number"
                value={priceTravel}
                onChange={(e) => setPriceTravel(Number(e.target.value))}
                placeholder="Ex: 250 €"
                required
            />

            <label>Dates</label>
            <input
                type="text"
                value={dates}
                onChange={(e) => setDates(e.target.value)}
                placeholder="Ex: du 12 au 20 mai"
                required
            />


            <label>Proposé par</label>
            <select
                value={proposedBy}
                onChange={(e) => setProposedBy(e.target.value)}
                required
            >
                <option value="">Sélectionner un membre</option>
                {members.map((member, index) => (
                    <option key={index} value={member}>
                        {member}
                    </option>
                ))}
            </select>

            <label>Lieu</label>
            <Autocomplete
                onLoad={(auto) => (autocompleteRef.current = auto)}
                onPlaceChanged={handlePlaceChanged}
            >
                <input
                    type="text"
                    placeholder="Tapez une adresse ou ville..."
                    style={{
                        width: '100%',
                        padding: '10px',
                        fontSize: '16px',
                        borderRadius: '8px',
                        marginBottom: '10px',
                        border: '1px solid #ccc',
                    }}
                    required
                />
            </Autocomplete>

            <button type="submit" className="create-button">
                Créer
            </button>
        </form>
    );
}
