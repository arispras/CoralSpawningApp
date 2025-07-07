import React, { useContext, useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import {
  createStackNavigator,
  StackNavigationProp,
} from "@react-navigation/stack";
import {
  createBottomTabNavigator,
  BottomTabNavigationProp,
} from "@react-navigation/bottom-tabs";
import { ActivityIndicator, View } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import ObservationFormScreen from "../screens/ObservationFormScreen";
import ObservationsListScreen from "../screens/ObservationsListScreen";
import ObservationDetailScreen from "../screens/ObservationDetailScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SyncService from "../services/SyncService";

import SettingScreen from "../screens/SettingScreen";
import FlashMessage from "react-native-flash-message";
import { useTranslation } from "react-i18next";
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Observations: undefined;
  ObservationsList: undefined;
  ObservationDetail: { observationId: number };
  ObservationForm: undefined;
  Profile: undefined;
  Setting: undefined;
  Auth: undefined;
};

export type AuthStackNavigationProp = StackNavigationProp<RootStackParamList>;
export type ObservationsStackNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Observations"
>;
export type TabNavigationProp = BottomTabNavigationProp<RootStackParamList>;

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootStackParamList>();

const ObservationsStack = () => {
  return (
    <Stack.Navigator initialRouteName="ObservationsList">
      <Stack.Screen
        name="ObservationsList"
        component={ObservationsListScreen}
        options={{ title: "Observations List" ,  headerShown: false  }}
      />
      <Stack.Screen
        name="ObservationForm"
        component={ObservationFormScreen}
        options={{ title: "New Observation" }}
      />
      <Stack.Screen
        name="ObservationDetail"
        component={ObservationDetailScreen}
        options={{ title: "Observation Detail" }}
      />
    </Stack.Navigator>
  );
};
const ProfileStack = () => {
  return (
    <Stack.Navigator initialRouteName="Profile">
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
    </Stack.Navigator>
  );
};

const AppStack: React.FC = () => {
    const { t } = useTranslation();  
  const [is_login, setIsLogin] = useState(false);

  useEffect(() => {
    init();
  });

  const init = async () => {

  };

  return (
    <Tab.Navigator
    //   screenOptions={({ route }) => ({
    //      tabBarIcon: ({color, size}) => (
    //                     <Ionicons name="person" size={size} color={color}/>
    //                 ),
    //     headerShown: false,
    //   })}
    >
      <Tab.Screen
        name="Observations"
        component={ObservationsStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
          title: t("observations"),
        }}
      />
      <Tab.Screen
        name="Auth"
        component={AuthStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
          title: t("setting"),
        }}
      />
    </Tab.Navigator>
  );
};

const AuthStack = () => {
  return (
    <Stack.Navigator  
      screenOptions={{ headerShown: true  }}
      initialRouteName="Setting"
    >
      <Stack.Screen name="Setting" component={SettingScreen}   options={{ headerShown: false  }}/>
      <Stack.Screen name="Login" component={LoginScreen}  />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen}   />
    </Stack.Navigator>
  );
};

const RootNavigator = () => {
  const isAppReady = true;

  if (!isAppReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
          <FlashMessage position={"bottom"} />
      <AppStack />
    </NavigationContainer>
  );
};

const AppNav = () => {
  return (
    <>
      <RootNavigator />
      {/* <SyncService /> */}
    </>
  );
};

export default AppNav;
