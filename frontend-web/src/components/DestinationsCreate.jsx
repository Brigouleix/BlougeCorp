import { useState, useRef } from 'react';
import { createDestination } from '../services/api';
import { useTranslation } from '../i18n/LanguageContext';
import '../styles/CreateDestination.css';

export default function CreateDestination({ onClose = () => {}, onCreate, groupId, members = [] }) {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [priceHouse, setPriceHouse] = useState('');
    const [priceTravel, setPriceTravel] = useState('');
    const [dates, setDates] = useState('');
    const [proposedBy, setProposedBy] = useState('');
    const [locationAddress, setLocationAddress] = useState('');
    const [location, setLocation] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const debounceRef = useRef(null);

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

    // Recherche d'adresse via Nominatim (OpenStreetMap) — gratuit, sans clé API
    const handleAddressChange = (e) => {
        const value = e.target.value;
        setLocationAddress(value);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (value.length < 3) {
            setSuggestions([]);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5`,
                    { headers: { 'Accept-Language': 'fr' } }
                );
                const data = await res.json();
                setSuggestions(data);
            } catch (err) {
                console.error('Erreur Nominatim:', err);
            }
        }, 400);
    };

    const selectSuggestion = (place) => {
        setLocation({
            lat: parseFloat(place.lat),
            lng: parseFloat(place.lon),
            address: place.display_name,
        });
        setLocationAddress(place.display_name);
        setSuggestions([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newDestination = {
            name,
            image,
            priceHouse: Number(priceHouse) || 0,
            priceTravel: Number(priceTravel) || 0,
            dates,
            proposedBy,
            members,
            location,
            groupId: groupId || null,
        };

        try {
            const result = await createDestination(newDestination);
            console.log('Destination créée :', result);
            if (onCreate) onCreate(result);
            onClose();
        } catch (error) {
            console.error('Erreur lors de la création de la destination :', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="destination-form">
            <h2>{t('dest.createTitle')}</h2>

            <label>{t('common.name')}</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />

            <label>{t('common.photo')}</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {imagePreview && <img src={imagePreview} alt="Preview" style={{ width: '50%', borderRadius: '8px' }} />}

            <label>{t('dest.priceHouse')}</label>
            <input type="number" value={priceHouse} onChange={(e) => setPriceHouse(e.target.value)} required />

            <label>{t('dest.priceTravel')}</label>
            <input type="number" value={priceTravel} onChange={(e) => setPriceTravel(e.target.value)} required />

            <label>{t('dest.dates')}</label>
            <input type="text" value={dates} onChange={(e) => setDates(e.target.value)} required />

            <label>{t('dest.proposedBy')}</label>
            <select value={proposedBy} onChange={(e) => setProposedBy(e.target.value)} required>
                <option value="">{t('dest.selectMember')}</option>
                {members.map((member, index) => (
                    <option key={index} value={member}>{member}</option>
                ))}
            </select>

            <label>{t('dest.location')}</label>
            <div style={{ position: 'relative' }}>
                <input
                    type="text"
                    value={locationAddress}
                    onChange={handleAddressChange}
                    placeholder={t('dest.addressPlaceholder')}
                    required
                />
                {suggestions.length > 0 && (
                    <ul style={{
                        position: 'absolute', top: '100%', left: 0, right: 0,
                        background: '#fff', border: '1px solid #ccc', borderRadius: '4px',
                        listStyle: 'none', padding: 0, margin: 0, zIndex: 1000, maxHeight: '200px', overflow: 'auto'
                    }}>
                        {suggestions.map((s, i) => (
                            <li
                                key={i}
                                onClick={() => selectSuggestion(s)}
                                style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                                onMouseEnter={(e) => e.target.style.background = '#f0f0f0'}
                                onMouseLeave={(e) => e.target.style.background = '#fff'}
                            >
                                {s.display_name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <button type="submit" className="create-button">{t('common.create')}</button>
        </form>
    );
}
