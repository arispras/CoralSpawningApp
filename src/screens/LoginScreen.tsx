import React, { useState, useContext } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Button, TextInput, Text, HelperText } from "react-native-paper";
import { login } from "../contexts/Auth";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { showMessage } from "react-native-flash-message";

type RegisterScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Register",
  "Profile"
>;

interface RegisterScreenProps {
  navigation: RegisterScreenNavigationProp;
}

const LoginScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // const { login } = useAuth();

  const handleLogin = async () => {
    // MATIKAN DULU VALIDASINYA //

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // return true;
      let res = await login(email, password);
      if (res) {
        // Alert.alert("Success", "Login successfully");
        showMessage({
          type: "success",
          message: "Login successfully",
        });
        navigation.navigate("Setting");
      } else {
        // Alert.alert("Fail", "Check your User or Password");
        showMessage({
          type: "danger",
          message: "Check your User or Password",
        });
      }
    } catch (error) {
      setError("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

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
        onPress={() => navigation.navigate("Register")}
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
    justifyContent: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
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
