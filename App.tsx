import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { getDatabase, initDatabase } from "./src/database/db";
import { Provider as PaperProvider } from "react-native-paper";
import ObservationFormScreen from "./src/screens/ObservationFormScreen";
import ObservationsListScreen from "./src/screens/ObservationsListScreen";
import ObservationDetailScreen from "./src/screens/ObservationDetailScreen";
import { View, Text } from "react-native";

const AppWrapper = () => {
  const [dbReady, setDbReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const Stack = createStackNavigator();

  const App: React.FC = () => {
    
    useEffect(() => {
      const initializeApp = async () => {
        try {
          const db =  await getDatabase();
            await initDatabase(db);
            setDbReady(true);
          
        } catch (err) {
          console.error("Database initialization failed:", err);
          setError("Failed to initialize database. Please restart the app.");
        }
      };

      initializeApp();
    }, []);
    if (error) {
      return (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ color: "red", fontSize: 18 }}>{error}</Text>
        </View>
      );
    }

    if (!dbReady) {
      return (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>Loading database...</Text>
        </View>
      );
    }

    return <App />;
  };
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="ObservationsList">
          <Stack.Screen
            name="ObservationsList"
            component={ObservationsListScreen}
            options={{ title: "My Observations" }}
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
      </NavigationContainer>
    </PaperProvider>
  );
};

export default AppWrapper;
