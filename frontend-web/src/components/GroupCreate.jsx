import { useState } from 'react';

export default function CreateGroup({ onClose }) {
    const [name, setName] = useState('');
    const [image, setImage] = useState(null);
    const [description, setDescription] = useState('');
const handleSubmit = async (e) => {
    e.preventDefault();
    const emails = emailList.split(',').map(email => email.trim());
    const base64Image = image ? await toBase64(image) : null;

    const res = await fetch('/index.php?action=create_group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, emails, image: base64Image, creator_id: 1 })
    });

    const result = await res.json();
    console.log(result);
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
