import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiService from "../services/api";
import { User, AuthContextType } from "../types";

export const isLogin = async (): Promise<boolean> => {
  try {
    // await initializeDatabase();
    const token = await AsyncStorage.getItem("authToken");
    if (token) {
      const userData = await ApiService.getUser();
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error during bootstrap", error);
    return false;
  } finally {
    //  return true;
  }
};
export const getUser = async (): Promise<User| null> => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    if (token) {
      const userData = (await ApiService.getUser()).data;
      return userData;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error during bootstrap", error);
    return null;
  } finally {
    //  return true;
  }
};

export const login = async (
  email: string,
  password: string
): Promise<boolean> => {
  try {
    const response = await ApiService.login({ email, password });
    await AsyncStorage.setItem("authToken", response.data.token);
    return true;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const register = async (
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
    // setUser(response.data.user);
    return true;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await ApiService.logout();
    await AsyncStorage.removeItem("authToken");
    // setUser(null);
  } catch (error) {
    console.error("Logout error:", error);
  }
};
