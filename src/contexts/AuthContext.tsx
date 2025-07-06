import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiService from "../services/api";
// import { initializeDatabase } from '../database/db';
import { User, AuthContextType } from "../types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        // await initializeDatabase();
        setIsAppReady(true);

        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          const userData = await ApiService.getUser();
          setUser(userData.data);
        }
      } catch (error) {
        console.error("Error during bootstrap", error);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await ApiService.login({ email, password });
      await AsyncStorage.setItem("authToken", response.data.token);
      setUser(response.data.user);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ): Promise<boolean> => {
    try {
      const response = await ApiService.register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      await AsyncStorage.setItem("authToken", response.data.token);
      setUser(response.data.user);
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await ApiService.logout();
      await AsyncStorage.removeItem("authToken");
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAppReady,
        isLoading,
        user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
