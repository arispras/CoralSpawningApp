import React, { useContext, useEffect } from "react";
import { getUser } from "../contexts/Auth";
import ObservationModel from "../models/Observation";
import NetInfo from "@react-native-community/netinfo";
import { useInterval } from "../hooks/useInterval";
import { User } from "../types";

const SyncService: React.FC = () => {
  var user:User | null;
  const checkUser  = async () => {
     user= await getUser();
  };
  useInterval(() => {
    if (user) {
      ObservationModel.syncWithBackend();
    }
  }, 30000); // Sync every 30 seconds

  useEffect(() => {
    checkUser();
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && user) {
        ObservationModel.syncWithBackend();
      }
    });

    return () => unsubscribe();
  });

  return null;
};

export default SyncService;
