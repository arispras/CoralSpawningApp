import React, { useContext, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ObservationModel from '../models/Observation';
import NetInfo from '@react-native-community/netinfo';
import { useInterval } from '../hooks/useInterval';

const SyncService: React.FC = () => {
  const { user } = useAuth();

  useInterval(() => {
    if (user) {
      ObservationModel.syncWithBackend();
    }
  }, 30000); // Sync every 30 seconds

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && user) {
        ObservationModel.syncWithBackend();
      }
    });

    return () => unsubscribe();
  }, [user]);

  return null;
};

export default SyncService;