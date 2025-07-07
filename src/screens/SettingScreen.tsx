import React, { useContext, useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Button, Text } from "react-native-paper";
import { logout } from "../contexts/Auth";
import ProfileSectionButton from "../components/buttons/SettingSectionButton";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LanguageBottomSheet from "../components/language/LanguageBottomSheet";
import { SheetManager } from "react-native-actions-sheet";
import { useTranslation } from "react-i18next";

type RootStackParamList = {
  Profile: undefined; // jika tidak ada params
  Login: undefined; // jika tidak ada params
  Language: { observationId: number | undefined };
};

const SettingScreen = () => {
  const { t } = useTranslation();
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
      {/* <Text style={styles.title}>Info</Text> */}

      {/* <Text>Email: arispras@gmail.com</Text>
      <Text>Name: Aris</Text> */}
      {isLogin ? (
        <>
          <Text>Email: {userDataObj!["email"]}</Text>
          <Text>Name: {userDataObj!["user_full_name"]}</Text>
          <ProfileSectionButton
            onPress={function (): void {
              navigation.navigate("Profile");
            }}
            title={t("profile")}
          />

          <ProfileSectionButton
            onPress={function (): void {
              //   throw new Error("Function not implemented.");
            }}
            title={t("synchronize")}
          />
        </>
      ) : (
        <>
          
          <Text>Please Login..</Text>
          <ProfileSectionButton
            onPress={function (): void {
              navigation.navigate("Login");
            }}
            title={"Login"}
          />
        </>
      )}
      <ProfileSectionButton
        onPress={() => SheetManager.show("LANG_SHEET")}
        title={t("languages")}
      />
        <LanguageBottomSheet />
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

export default SettingScreen;
