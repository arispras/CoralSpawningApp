// import { db } from '../database/db';
import ApiService from '../services/api';
import NetInfo from '@react-native-community/netinfo';
import * as FileSystem from 'expo-file-system';
import { Observation, Photo } from '../types';

class ObservationModel {
  async create(observation: Observation): Promise<number> {
    const isConnected = await NetInfo.fetch().then(state => state.isConnected);
    
    if (isConnected) {
      try {
        const response = await ApiService.createObservation(observation);
        observation.id = response.data.id;
        observation.is_synced = true;
      } catch (error) {
        console.log('Server create failed, saving locally', error);
        observation.is_synced = false;
      }
    } else {
      observation.is_synced = false;
    }
// TAMBAHKAN SIMPAN KE LOCAL DB

    return 1
  }

//   async getAll(): Promise<Observation[]> {
//     return new Promise((resolve, reject) => {
//       db.transaction(tx => {
//         tx.executeSql(
//           'SELECT * FROM observations ORDER BY id DESC',
//           [],
//           (_, { rows }) => resolve(rows._array as Observation[]),
//           (_, error) => reject(error)
//         );
//       });
//     });
//   }

//   async getById(id: number): Promise<Observation | undefined> {
//     return new Promise((resolve, reject) => {
//       db.transaction(tx => {
//         tx.executeSql(
//           'SELECT * FROM observations WHERE id = ?',
//           [id],
//           (_, { rows }) => resolve(rows._array[0] as Observation),
//           (_, error) => reject(error)
//         );
//       });
//     });
//   }

  async update(id: number, observation: Partial<Observation>): Promise<number> {
    const isConnected = await NetInfo.fetch().then(state => state.isConnected);
    // observation.is_synced = isConnected;

    if (isConnected) {
      try {
        await ApiService.updateObservation(id, observation);
        observation.is_synced = true;
      } catch (error) {
        console.log('Server update failed, saving locally', error);
        observation.is_synced = false;
      }
    }

    // UPDATE KE LOCAL DB
    return 1;
  }

  async delete(id: number): Promise<number> {
    const isConnected = await NetInfo.fetch().then(state => state.isConnected);
    
    if (isConnected) {
      try {
        await ApiService.deleteObservation(id);
      } catch (error) {
        console.log('Server delete failed, deleting locally', error);
      }
    }

    // DELETE LOCAL DB
    return 1;
  }

  async syncWithBackend(): Promise<void> {
    const isConnected = await NetInfo.fetch().then(state => state.isConnected);
    if (!isConnected) return;

    try {
    //   const unsyncedObservations = await new Promise<Observation[]>((resolve, reject) => {
    //     db.transaction(tx => {
    //       tx.executeSql(
    //         'SELECT * FROM observations WHERE is_synced = 0',
    //         [],
    //         (_, { rows }) => resolve(rows._array as Observation[]),
    //         (_, error) => reject(error)
    //       );
    //     });
    //   });

    //   for (const observation of unsyncedObservations) {
    //     const photos = await new Promise<Photo[]>((resolve, reject) => {
    //       db.transaction(tx => {
    //         tx.executeSql(
    //           'SELECT * FROM photos WHERE observationId = ?',
    //           [observation.id],
    //           (_, { rows }) => resolve(rows._array as Photo[]),
    //           (_, error) => reject(error)
    //         );
    //       });
    //     });

    //     const photosWithBase64 = await Promise.all(photos.map(async photo => {
    //       if (photo.photoUri) {
    //         const base64 = await FileSystem.readAsStringAsync(photo.photoUri, {
    //           encoding: FileSystem.EncodingType.Base64,
    //         });
    //         return {
    //           ...photo,
    //           photo: `data:image/jpeg;base64,${base64}`,
    //         };
    //       }
    //       return photo;
    //     }));

    //     if (observation.id) {
    //       await ApiService.updateObservation(observation.id, {
    //         ...observation,
    //         photos: photosWithBase64,
    //       });
    //     } else {
    //       const response = await ApiService.createObservation({
    //         ...observation,
    //         photos: photosWithBase64,
    //       });
          
    //       await new Promise((resolve, reject) => {
    //         db.transaction(tx => {
    //           tx.executeSql(
    //             'UPDATE observations SET id = ?, is_synced = 1 WHERE id = ?',
    //             [response.data.id, observation.id],
    //             (_, result) => resolve(result),
    //             (_, error) => reject(error)
    //           );
    //         });
    //       });
    //     }

    //     await new Promise((resolve, reject) => {
    //       db.transaction(tx => {
    //         tx.executeSql(
    //           'UPDATE observations SET is_synced = 1 WHERE id = ?',
    //           [observation.id],
    //           (_, result) => resolve(result),
    //           (_, error) => reject(error)
    //         );
    //       });
    //     });
    //   }

      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Error during sync:', error);
    }
  }
}

export default new ObservationModel();