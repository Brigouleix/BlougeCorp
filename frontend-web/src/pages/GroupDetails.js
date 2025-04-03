import { useParams } from 'react-router-dom';

export default function GroupDetails() {
    const { groupId } = useParams();

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Détails du groupe #{groupId}</h1>
            {/* À compléter avec les données réelles */}
        </div>
    );
}