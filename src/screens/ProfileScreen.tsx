
import React, { useContext } from "react";
import { View, StyleSheet } from "react-native";
import { Button, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from '../contexts/AuthContext';

const ProfileScreen = () => {
    const { user, logout } =useAuth();

  return (

    <View style={styles.container}>
      <Text style={styles.title}>Info</Text>
      {/* <Text>Email: {user?.email}</Text>
      <Text>Name: {user?.name}</Text> */}
      <Text>Email: arispras@gmail.com</Text>
      <Text>Name: Aris</Text>
      <Button
        mode="contained"
        onPress={logout}
        style={styles.button}
      >
        Logout
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
});

export default ProfileScreen;
