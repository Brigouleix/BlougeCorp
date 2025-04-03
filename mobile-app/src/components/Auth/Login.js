// �cran de connexion mobile
import { View, TextInput, Button } from 'react-native';
import { login } from '../services/api'; // M�me service que le web !

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        await login(email, password); // R�utilise la m�me fonction API
    };

    return (
        <View>
            <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
            <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
            <Button title="Se connecter" onPress={handleLogin} />
        </View>
    );
}