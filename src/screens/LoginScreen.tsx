// src/screens/LoginScreen.js
import React, { useState, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, TextInput, Text, HelperText } from 'react-native-paper';
// import { useAuth } from '../contexts/AuthContext';
import {login} from '../contexts/Auth';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type RegisterScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Register'
>;

interface RegisterScreenProps {
  navigation: RegisterScreenNavigationProp;
}

const LoginScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // const { login } = useAuth();

  const handleLogin = async () => {
    // MATIKAN DULU VALIDASINYA //

    // if (!email || !password) {
    //   setError('Please fill in all fields');
    //   return;
    // }

    setIsLoading(true);
    setError('');

    try {
      // return true;
     await login(email, password);
    } catch (error) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reef Monitoring</Text>
      
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />

      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      {error ? <HelperText type="error">{error}</HelperText> : null}

      <Button 
        mode="contained" 
        onPress={handleLogin} 
        loading={isLoading}
        disabled={isLoading}
        style={styles.button}
      >
        Login
      </Button>

      <Button 
        onPress={() => navigation.navigate('Register')}
        style={styles.button}
      >
        Don't have an account? Register
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});

export default LoginScreen;