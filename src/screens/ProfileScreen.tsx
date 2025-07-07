import React, { useContext, useEffect, useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Button, Text } from "react-native-paper";
import { logout } from "../contexts/Auth";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
type RootStackParamList = {
  Setting: undefined; // jika tidak ada params
};

const ProfileScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [userData, setUserData] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const [userDataObj, setUserDataObj] = useState(null);

  useEffect(() => {
    getUserData();
  }, [isLogin]);

  const getUserData = async () => {
    const user = await AsyncStorage.getItem("userData");
    setUserData(user!);
    if (user != null) {
      setIsLogin(true);
      setUserDataObj(JSON.parse(user!));
    } else {
      setIsLogin(false);
      setUserDataObj(null);
    }
    console.log("islogin", isLogin);
    // console.log("userData", userData);
  };
  return (
    <View style={styles.container}>
      {isLogin ? (
        <>
          <Text>Email: {userDataObj!["email"]}</Text>
          <Text>Name: {userDataObj!["user_full_name"]}</Text>
          

          <Button
            mode="contained"
            onPress={function (): void {
              logout();
              Alert.alert("Success", "Logout successfully");
              navigation.navigate("Setting");
            }}
            style={styles.button}
          >
            Logout
          </Button>
        </>
      ) : (
        <Text>Please Login ..</Text>
      )}
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
