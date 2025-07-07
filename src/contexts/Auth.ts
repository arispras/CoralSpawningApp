import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiService from "../services/api";
import { User, AuthContextType } from "../types";

export const isLogin = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    if (token) {
      // const userData = await ApiService.getUser();
      return false;
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
export const getUser = async (): Promise<object> => {
  try {
    const usr = await AsyncStorage.getItem("userData");
    const userData=JSON.parse(usr!);
    return userData;
  } catch (error) {
    console.error("Error during bootstrap", error);
    return {};
  } finally {
 
  }
};

export const login = async (
  email: string,
  password: string
): Promise<boolean> => {
  try {
    const response: any = await ApiService.login({ email, password });
    let result = response["data"];
    let data = result["data"];
    let status = result["status"];
    console.log(data);
    console.log(status);
    // await AsyncStorage.setItem("authToken", response.data.token);
    if (status == "OK") {
      await AsyncStorage.setItem("userData", JSON.stringify(data));
      return true;
    } else {
      await AsyncStorage.removeItem("userData");
      return false;
    }
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
    // await ApiService.logout();
    // await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("userData");
    // setUser(null);
   
  } catch (error) {
    console.error("Logout error:", error);
  }
};
