export default function GradientButton({ children }) {
    return (
        <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded">
            {children}
        </button>
    );
}