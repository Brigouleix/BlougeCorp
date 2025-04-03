// Écran de connexion mobile
import { View, TextInput, Button } from 'react-native';
import { login } from '../services/api'; // Même service que le web !

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        await login(email, password); // Réutilise la même fonction API
    };

    return (
        <View>
            <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
            <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
            <Button title="Se connecter" onPress={handleLogin} />
        </View>
    );
}