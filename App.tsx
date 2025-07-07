import React, { useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { getDatabase, initDatabase } from "./src/database/db";
import { Provider as PaperProvider } from "react-native-paper";

import { View, Text } from "react-native";
import AppNav from "./src/navigation/AppNavigator";
import i18n from "./src/localization/i18n";
import { I18nextProvider } from "react-i18next";

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
       <I18nextProvider i18n={i18n}>
      <AppNav/>
      </I18nextProvider>
    </PaperProvider>
  );
};

export default AppWrapper;
