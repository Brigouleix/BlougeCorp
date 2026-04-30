import { useState, useRef } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import '../styles/CreateDestination.css';

export default function EditDestination({ destination, members = [], onSave, onClose }) {
    const { t } = useTranslation();
    const [name, setName] = useState(destination.name || '');
    const [priceHouse, setPriceHouse] = useState(destination.priceHouse ?? '');
    const [priceTravel, setPriceTravel] = useState(destination.priceTravel ?? '');
    const [dates, setDates] = useState(destination.dates || '');
    const [imagePreview, setImagePreview] = useState(destination.image || null);
    const [imageData, setImageData] = useState(undefined); // undefined = pas changé
    const [locationAddress, setLocationAddress] = useState(destination.location?.address || '');
    const [location, setLocation] = useState(destination.location || null);
    const [suggestions, setSuggestions] = useState([]);
    const [saving, setSaving] = useState(false);
    const debounceRef = useRef(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
            setImageData(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleAddressChange = (e) => {
        const value = e.target.value;
        setLocationAddress(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (value.length < 3) { setSuggestions([]); return; }
        debounceRef.current = setTimeout(async () => {
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5`,
                    { headers: { 'Accept-Language': 'fr' } }
                );
                setSuggestions(await res.json());
            } catch {}
        }, 400);
    };

    const selectSuggestion = (place) => {
        const loc = { lat: parseFloat(place.lat), lng: parseFloat(place.lon), address: place.display_name };
        setLocation(loc);
        setLocationAddress(place.display_name);
        setSuggestions([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const fields = {
            name,
            priceHouse: Number(priceHouse) || 0,
            priceTravel: Number(priceTravel) || 0,
            dates,
            location: location || destination.location,
        };
        if (imageData !== undefined) fields.image = imageData;
        await onSave(destination.id, fields);
        setSaving(false);
    };

    return (
        <form onSubmit={handleSubmit} className="destination-form">
            <h2>{t('dest.editTitle')}</h2>

            <label>{t('common.name')}</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required />

            <label>{t('common.photo')}</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {imagePreview && (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img src={imagePreview} alt="Preview" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 10, marginTop: 6 }} />
                    <button type="button" onClick={() => { setImagePreview(null); setImageData(null); }}
                        style={{ position: 'absolute', top: 6, right: 4, background: 'rgba(0,0,0,0.55)', color: '#fff', border: 'none', borderRadius: '50%', width: 26, height: 26, cursor: 'pointer', fontSize: 14 }}>✕</button>
                </div>
            )}

            <label>{t('dest.priceHouse')}</label>
            <input type="number" min="0" value={priceHouse} onChange={e => setPriceHouse(e.target.value)} />

            <label>{t('dest.priceTravel')}</label>
            <input type="number" min="0" value={priceTravel} onChange={e => setPriceTravel(e.target.value)} />

            <label>{t('dest.dates')}</label>
            <input type="text" value={dates} onChange={e => setDates(e.target.value)} placeholder="ex: 12-15 juillet" />

            <label>{t('dest.location')}</label>
            <div style={{ position: 'relative' }}>
                <input
                    type="text"
                    value={locationAddress}
                    onChange={handleAddressChange}
                    placeholder={t('dest.addressPlaceholder')}
                />
                {suggestions.length > 0 && (
                    <ul style={{
                        position: 'absolute', top: '100%', left: 0, right: 0,
                        background: '#fff', border: '1px solid #ccc', borderRadius: 4,
                        listStyle: 'none', padding: 0, margin: 0, zIndex: 1000, maxHeight: 200, overflow: 'auto'
                    }}>
                        {suggestions.map((s, i) => (
                            <li key={i} onClick={() => selectSuggestion(s)}
                                style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #eee', fontSize: '0.88rem' }}
                                onMouseEnter={e => e.target.style.background = '#f0f0f0'}
                                onMouseLeave={e => e.target.style.background = '#fff'}>
                                {s.display_name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="submit" className="create-button" disabled={saving} style={{ flex: 1 }}>
                    {saving ? t('dest.saving') : `✅ ${t('common.save')}`}
                </button>
                <button type="button" onClick={onClose}
                    style={{ flex: 1, padding: '0.65rem', borderRadius: 12, border: '1px solid #e5e7eb', background: 'transparent', cursor: 'pointer', fontWeight: 600 }}>
                    {t('common.cancel')}
                </button>
            </div>
        </form>
    );
}
