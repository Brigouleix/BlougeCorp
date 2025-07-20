import { useState } from 'react';
import { createGroup } from '../services/api';
import '../styles/MyGroup.css'
import { getCurrentUser } from '../services/api'; 


export default function CreateGroup({ onClose, onCreated }) {
  const [name, setName]             = useState('');
  const [emails, setEmails]         = useState('');
  const [description, setDesc]      = useState('');
  const [image, setImage]           = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error,   setError]         = useState('');

  const fileToBase64 = file =>
    new Promise((res, rej) => {
      const r = new FileReader();
      r.onload  = () => res(r.result);
      r.onerror = () => rej('Erreur lecture image');
      r.readAsDataURL(file);
    });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const base64 = image ? await fileToBase64(image) : null;
      const currentUser = getCurrentUser();
      if (!currentUser?.email) throw new Error("Utilisateur non connecté");

      const membersList = emails.split(',').map(s => s.trim()).filter(Boolean);
      // On n'ajoute pas l'email du créateur ici, il sera ajouté côté backend

      const newGroup = await createGroup({
        name,
        emails: [...new Set(membersList)],
        description,
        image: base64,
        // Pas besoin d'envoyer creator, backend l'ajoute via token
      });

      onCreated(newGroup);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="create-group-form">
      <h2>Créer un nouveau groupe</h2>

      <label>Nom</label>
      <input value={name} onChange={e=>setName(e.target.value)} required />

      <label>Emails (séparés par virgule)</label>
      <input value={emails} onChange={e=>setEmails(e.target.value)} />

      <label>Image</label>
      <input type="file" accept="image/*" onChange={e=>setImage(e.target.files[0])} />

      <label>Description</label>
      <textarea rows={3} value={description} onChange={e=>setDesc(e.target.value)} />

      {error && <p className="error">{error}</p>}
      <button disabled={loading}>{loading ? 'Envoi…' : 'Créer'}</button>
    </form>
  );
}