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
import { MaterialIcons } from "@expo/vector-icons";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import ObservationFormScreen from "../screens/ObservationFormScreen";
import ObservationsListScreen from "../screens/ObservationsListScreen";
import ObservationDetailScreen from "../screens/ObservationDetailScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SyncService from "../services/SyncService";
import { login, logout, isLogin } from "../contexts/Auth";
import { Observation } from "../types";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Observations: undefined;
  ObservationsList: undefined;
  ObservationDetail: { observationId: number };
  ObservationForm: undefined;
  Profile: undefined;
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
        options={{ title: "Observations List" }}
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
  const [is_login, setIsLogin] = useState(false);

  useEffect(() => {
    init();
  });

  const init = async () => {
    const is_log = await isLogin();
    console.log(is_log);
    setIsLogin(is_log);
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: "list" | "person" = "list";

          if (route.name === "Profile") {
            iconName = "person";
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Observations" component={ObservationsStack} />
      {is_login ? (
        <Tab.Screen name="Profile" component={ProfileStack} />
      ) : (
        <Tab.Screen name="Auth" component={AuthStack} />
      )}
    </Tab.Navigator>
  );
};

const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Login"
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

// const RootNavigator = () => {
// //   const { user, isAppReady } = useAuth();

// // SETTING TRUE //
//  const isAppReady=true;
//  const user={"username":"admin"};

//   if (!isAppReady) {
//     return (
//       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//         <ActivityIndicator size="large" />
//       </View>
//     );
//   }

//   return (
//     <NavigationContainer>
//       {user ? <AppStack /> : <AuthStack />}
//     </NavigationContainer>
//   );
// };

const RootNavigator = () => {
  //   const { user, isAppReady } = useAuth();

  // SETTING TRUE //
  const isAppReady = true;
  const user = { username: "admin" };

  if (!isAppReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <AppStack />
    </NavigationContainer>
  );
};
const AppNav = () => {
  return (
    <>
      <AuthProvider>
        <RootNavigator />
        <SyncService />
      </AuthProvider>
    </>
  );
};

export default AppNav;
