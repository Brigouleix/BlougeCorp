// src/components/CreateDestination.jsx
import { useState, useRef } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import '../styles/CreateDestination.css';

export default function CreateDestination({
  onClose = () => {},
  defaultMembers = [],
  groupId,
}) {
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [priceHouse, setPriceHouse] = useState('');
  const [priceTravel, setPriceTravel] = useState('');
  const [dates, setDates] = useState('');
  const [proposedBy, setProposedBy] = useState('');
  const [members] = useState(defaultMembers);
  const [location, setLocation] = useState(null);
  const autocompleteRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    if (!place?.geometry) return;
    setLocation({
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
      address: place.formatted_address,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!proposedBy) {
      alert("Veuillez sélectionner la personne qui propose la destination.");
      return;
    }

    const payload = {
      groupId,
      name,
      image, // Peut être null
      priceHouse: Number(priceHouse),
      priceTravel: Number(priceTravel),
      dates,
      proposedBy,
      members, // Tableau d’emails/noms
      location, // Peut être null
    };

    try {
      const res = await fetch('http://blougecorp.local/api/destinations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const { error = 'Erreur inconnue' } = await res.json();
        throw new Error(error);
      }

      const newDest = await res.json();
      onClose(newDest);
    } catch (err) {
      alert('Erreur : ' + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="destination-form">
      <h2>Créer une destination</h2>

      <label>Nom</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        placeholder="Nom de la destination"
      />

      <label>Image</label>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      {preview && <img src={preview} alt="aperçu" style={{ width: '50%' }} />}

      <label>Prix logement</label>
      <input
        type="number"
        value={priceHouse}
        onChange={(e) => setPriceHouse(e.target.value)}
        required
        min="0"
        step="any"
        placeholder="Prix du logement"
      />

      <label>Prix transport</label>
      <input
        type="number"
        value={priceTravel}
        onChange={(e) => setPriceTravel(e.target.value)}
        required
        min="0"
        step="any"
        placeholder="Prix du transport"
      />

      <label>Dates</label>
      <input
        type="text"
        value={dates}
        onChange={(e) => setDates(e.target.value)}
        required
        placeholder="Ex: 27/08 - 29/08"
      />

      <label>Proposé par</label>
      <select
        value={proposedBy}
        onChange={(e) => setProposedBy(e.target.value)}
        required
      >
        <option value="">— Sélectionner —</option>
        {members.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>

      <label>Lieu</label>
      <Autocomplete
        onLoad={(auto) => (autocompleteRef.current = auto)}
        onPlaceChanged={handlePlaceChanged}
      >
        <input placeholder="Adresse ou ville" />
      </Autocomplete>

      <button className="create-button" type="submit">
        Créer
      </button>
    </form>
  );
}
