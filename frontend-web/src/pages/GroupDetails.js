import { useParams } from 'react-router-dom';

export default function GroupDetails() {
    const { groupId } = useParams();

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">D�tails du groupe #{groupId}</h1>
            {/* � compl�ter avec les donn�es r�elles */}
        </div>
    );
}