import { useState, useEffect, useRef } from 'react';
import { LoadScript, Autocomplete } from '@react-google-maps/api';
import myGroupsMock from '../mocks/myGroupsMock';
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
        const allMembers = myGroupsMock
            .flatMap(group => group.members)
            .filter((value, index, self) => self.indexOf(value) === index);
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
            setLocation({
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
                address: place.formatted_address
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newDestination = {
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
            const res = await fetch("http://localhost/BlougeCorp/backend/public/api/destinations/create", {
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
            <Autocomplete onLoad={(auto) => (autocompleteRef.current = auto)} onPlaceChanged={handlePlaceChanged}>
                <input type="text" placeholder="Tapez une adresse ou ville..." required />
            </Autocomplete>

            <button type="submit" className="create-button">Créer</button>
        </form>
    );
}
