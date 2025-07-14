// GroupCreate.jsx
import { useState } from "react";

export default function CreateGroup({ onClose, afterCreate }) {
  const [name, setName]           = useState("");
  const [emailList, setEmailList] = useState("");
  const [image, setImage]         = useState(null);
  const [description, setDesc]    = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  const toBase64 = file =>
    new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload  = () => res(reader.result);
      reader.onerror = rej;
      reader.readAsDataURL(file);
    });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const base64Image = image ? await toBase64(image) : null;
      const emails      = emailList.split(",").map(e => e.trim()).filter(Boolean);
      const token       = localStorage.getItem("token");

      const res = await fetch("http://blougecorp.local/api/groups/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          emails,
          image: base64Image,
          description
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur serveur");

      // 👉 Actualiser la liste côté parent (optionnel)
      afterCreate?.(data);

      // 👉 Fermer la modale
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

      <label>Nom du groupe</label>
      <input value={name} onChange={e => setName(e.target.value)} required />

      <label>Emails membres (séparés par des virgules)</label>
      <input value={emailList} onChange={e => setEmailList(e.target.value)} />

      <label>Image du groupe</label>
      <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} />

      <label>Description</label>
      <textarea value={description} onChange={e => setDesc(e.target.value)} rows={3} />

      {error && <p className="error">{error}</p>}

      <button disabled={loading}>{loading ? "Création…" : "Créer"}</button>
    </form>
  );
}
