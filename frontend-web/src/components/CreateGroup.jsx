// // src/pages/CreateGroup.jsx

// import React, { useState } from 'react';

// const CreateGroup = ({ currentUser }) => {
//     const [groupName, setGroupName] = useState('');
//     const [members, setMembers] = useState([currentUser.username]); // L'utilisateur qui crée le groupe est membre
//     const [error, setError] = useState('');

//     const handleCreateGroup = () => {
//         if (!groupName) {
//             setError("Le nom du groupe ne peut pas être vide.");
//             return;
//         }

//         // Simuler la création du groupe (sans API pour l'instant)
//         console.log("Nouveau groupe créé:", {
//             name: groupName,
//             members: members,
//             creator: currentUser.username,
//         });

//         // Redirige vers la page "Mes Groupes" après la création
//         window.location.href = '/my-groups';
//     };

//     return (
//         <div className="create-group-page">
//             <h1>Créer un Nouveau Groupe</h1>
//             <input
//                 type="text"
//                 placeholder="Nom du groupe"
//                 value={groupName}
//                 onChange={e => setGroupName(e.target.value)}
//             />
//             {error && <p className="error">{error}</p>}
//             <button onClick={handleCreateGroup}>Créer</button>
//         </div>
//     );
// };

// export default CreateGroup;
