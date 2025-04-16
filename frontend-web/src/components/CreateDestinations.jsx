// // src/pages/CreateGroup.jsx

// import React, { useState } from 'react';

// const CreateDestination = ({ currentUser }) => {
//     const [DestinationName, setDestinationName] = useState('');
//     const [members, setMembers] = useState([currentUser.username]); // L'utilisateur qui crée le groupe est membre
//     const [error, setError] = useState('');

//     const handleCreateGroup = () => {
//         if (!DestinationName) {
//             setError("Le nom du groupe ne peut pas être vide.");
//             return;
//         }

//         // Simuler la création du groupe (sans API pour l'instant)
//         console.log("Nouveau groupe créé:", {
//             name: DestinationName,
//             members: members,
//             creator: currentUser.username,
//         });

//         // Redirige vers la page "Mes Groupes" après la création
//         window.location.href = '/my-groups';
//     };

//     return (
//         <div className="create-group-page">
//             <h1>Créer une nouvelle destination</h1>
//             <input
//                 type="text"
//                 placeholder="Nom de la destination"
//                 value={DestinationName}
//                 onChange={e => setDestinationName(e.target.value)}
//             />
//             {error && <p className="error">{error}</p>}
//             <button onClick={handleCreateGroup}>Créer</button>
//         </div>
//     );
// };

// export default CreateDestination;
