import { useEffect, useState } from 'react';
import { fetchPhotos, uploadPhoto, deletePhoto, getCurrentUser } from '../services/api';
import '../styles/PhotoAlbum.css';

export default function PhotoAlbum({ groupId }) {
    const [photos, setPhotos] = useState([]);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [caption, setCaption] = useState('');
    const currentUser = getCurrentUser();

    useEffect(() => {
        fetchPhotos(groupId).then(setPhotos).catch(console.error);
    }, [groupId]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validation : max 5 MB
        if (file.size > 5 * 1024 * 1024) {
            alert('La photo ne doit pas dépasser 5 Mo.');
            return;
        }

        setUploading(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                const newPhoto = await uploadPhoto(groupId, reader.result, caption);
                setPhotos(prev => [newPhoto, ...prev]);
                setCaption('');
                // Reset file input
                e.target.value = '';
            } catch (error) {
                alert(error.message);
            } finally {
                setUploading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleDelete = async (photoId) => {
        try {
            await deletePhoto(photoId);
            setPhotos(prev => prev.filter(p => p.id !== photoId));
            if (selectedPhoto?.id === photoId) setSelectedPhoto(null);
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="photo-album">
            <h2>Album Photos</h2>

            {/* Upload */}
            <div className="photo-upload">
                <input
                    type="text"
                    placeholder="Légende (optionnel)"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="photo-caption-input"
                />
                <label className="upload-button">
                    {uploading ? 'Envoi...' : '+ Ajouter une photo'}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                        style={{ display: 'none' }}
                    />
                </label>
            </div>

            {/* Grille de photos */}
            <div className="photo-grid">
                {photos.map(photo => (
                    <div key={photo.id} className="photo-card">
                        <img
                            src={photo.image}
                            alt={photo.caption || 'Photo'}
                            onClick={() => setSelectedPhoto(photo)}
                        />
                        <div className="photo-info">
                            <span className="photo-author">{photo.username}</span>
                            {photo.caption && (
                                <span className="photo-caption">{photo.caption}</span>
                            )}
                        </div>
                        {currentUser && currentUser.id === photo.user_id && (
                            <button
                                className="photo-delete-btn"
                                onClick={() => handleDelete(photo.id)}
                            >
                                🗑
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {photos.length === 0 && (
                <p className="no-photos">Aucune photo pour le moment. Ajoutez-en une !</p>
            )}

            {/* Lightbox */}
            {selectedPhoto && (
                <div className="photo-lightbox" onClick={() => setSelectedPhoto(null)}>
                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <button className="lightbox-close" onClick={() => setSelectedPhoto(null)}>✖</button>
                        <img src={selectedPhoto.image} alt={selectedPhoto.caption || 'Photo'} />
                        <div className="lightbox-info">
                            <span className="lightbox-author">{selectedPhoto.username}</span>
                            {selectedPhoto.caption && (
                                <p className="lightbox-caption">{selectedPhoto.caption}</p>
                            )}
                            <span className="lightbox-date">
                                {new Date(selectedPhoto.created_at).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
