import {
  openDatabaseAsync,
  openDatabaseSync,
  SQLiteDatabase,
} from "expo-sqlite";
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import { Platform } from 'react-native';
export enum MonitorType {
  DIVE = "DIVE",
  TRAP = "TRAP",
  CAMERA = "CAMERA",
  OTHER = "OTHER",
}

export interface Photo {
  id?: number;
  description: string;
  photo: string; // base64 encoded image or file URI
  observationId: number;
}

export interface Observation {
  id?: number;
  email: string;
  location: string;
  reefName: string;
  latitude: number;
  longitude: number;
  monitorBy: MonitorType;
  genus?: string;
  species?: string;
  confident?: number;
  colonyDepth?: number;
  comment?: string;
  iswitness?: boolean;
  spawningDate?: string;
  deployedDate?: string;
  recoverDate?: string;
  diveDate?: string;
  diveStartTime?: string;
  spawnTime?: string;
  colonyCount?: number;
  maxDepth?: number;
  userId?: number;
}

export interface User {
  id?: number;
  usernama: string;
  fillname: string;
}

const DATABASE_NAME = 'coral_monitoring_v2.db';

// Helper untuk path database
const getDbPath = () => {
  if (Platform.OS === 'web') {
    return DATABASE_NAME;
  }
  return `${FileSystem.documentDirectory}SQLite/${DATABASE_NAME}`;
};
// let db: SQLiteDatabase | null = null;

//Variabel singleton untuk database
let databaseInstance: SQLiteDatabase | null = null;

// Fungsi untuk mendapatkan instance database
export const getDatabase = async (): Promise<SQLiteDatabase> => {
  if (databaseInstance) {
    return databaseInstance;
  }

  // Pastikan direktori SQLite ada
  if (Platform.OS !== 'web') {
    const dirInfo = await FileSystem.getInfoAsync(`${FileSystem.documentDirectory}SQLite`);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}SQLite`, {
        intermediates: true,
      });
    }
  }

  // Buka database
  databaseInstance = openDatabaseSync(DATABASE_NAME);

  // Inisialisasi schema
  await initDatabase(databaseInstance);

  return databaseInstance;
};

export const initDatabase = async (database: SQLiteDatabase): Promise<void> => {
  await database.execAsync(`
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;
        
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usernama TEXT NOT NULL,
            fillname TEXT NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS observations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT,
            location TEXT NOT NULL,
            reefName TEXT NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            monitorBy TEXT NOT NULL,
            genus TEXT,
            species TEXT,
            confident INTEGER,
            colonyDepth INTEGER,
            comment TEXT,
            iswitness BOOLEAN,
            spawningDate TEXT,
            deployedDate TEXT,
            recoverDate TEXT,
            diveDate TEXT,
            diveStartTime TEXT,
            spawnTime TEXT,
            colonyCount INTEGER,
            maxDepth INTEGER,
            userId INTEGER,
            FOREIGN KEY(userId) REFERENCES users(id)
        );
        
        CREATE TABLE IF NOT EXISTS photos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            description TEXT,
            photo TEXT NOT NULL,
            observationId INTEGER NOT NULL,
            FOREIGN KEY(observationId) REFERENCES observations(id) ON DELETE CASCADE
        );
    `);
};

// User CRUD operations
export const addUser = async (user: User): Promise<number> => {
  const database = await getDatabase();
  const result = await database.runAsync(
    "INSERT INTO users (usernama, fillname) VALUES (?, ?)",
    [user.usernama, user.fillname]
  );
  return result.lastInsertRowId as number;
};

export const getUser = async (id: number): Promise<User | null> => {
  const database = await getDatabase();
  const result = await database.getFirstAsync<User>(
    "SELECT * FROM users WHERE id = ?",
    [id]
  );
  return result;
};

// Observation CRUD operations
export const addObservation = async (
  observation: Observation
): Promise<number> => {
  const database = await getDatabase();
  const result = await database.runAsync(
    `INSERT INTO observations (
            email, location, reefName, latitude, longitude, monitorBy,
            genus, species, confident, colonyDepth, comment, iswitness,
            spawningDate, deployedDate, recoverDate, diveDate, diveStartTime,
            spawnTime, colonyCount, maxDepth, userId
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      observation.email,
      observation.location,
      observation.reefName,
      observation.latitude,
      observation.longitude,
      observation.monitorBy,
      observation.genus,
      observation.species,
      observation.confident,
      observation.colonyDepth,
      observation.comment,
      observation.iswitness ? 1 : 0,
      observation.spawningDate,
      observation.deployedDate,
      observation.recoverDate,
      observation.diveDate,
      observation.diveStartTime,
      observation.spawnTime,
      observation.colonyCount,
      observation.maxDepth,
      observation.userId,
    ]
  );
  return result.lastInsertRowId as number;
};

export const getObservations = async (
  userId?: number
): Promise<Observation[]> => {
  const database = await getDatabase();
  let query = "SELECT * FROM observations";
  const params: any[] = [];

  if (userId) {
    query += " WHERE userId = ?";
    params.push(userId);
  }

  const result = await database.getAllAsync<Observation>(query, params);
  return result;
};

export const getObservation = async (
  id: number
): Promise<Observation | null> => {
  const database = await getDatabase();
  const result = await database.getFirstAsync<Observation>(
    "SELECT * FROM observations WHERE id = ?",
    [id]
  );
  return result;
};

export const updateObservation = async (
  id: number,
  observation: Partial<Observation>
): Promise<void> => {
  const database = await getDatabase();
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(observation)) {
    if (value !== undefined && key !== "id") {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (fields.length > 0) {
    values.push(id);
    await database.runAsync(
      `UPDATE observations SET ${fields.join(", ")} WHERE id = ?`,
      values
    );
  }
};

export const deleteObservation = async (id: number): Promise<void> => {
  const database = await getDatabase();
  await database.runAsync("DELETE FROM observations WHERE id = ?", [id]);
};

// Photo CRUD operations
export const addPhoto = async (photo: Photo): Promise<number> => {
  const database = await getDatabase();
  const result = await database.runAsync(
    "INSERT INTO photos (description, photo, observationId) VALUES (?, ?, ?)",
    [photo.description, photo.photo, photo.observationId]
  );
  return result.lastInsertRowId as number;
};

export const getPhotosByObservation = async (
  observationId: number
): Promise<Photo[]> => {
  const database = await getDatabase();
  const result = await database.getAllAsync<Photo>(
    "SELECT * FROM photos WHERE observationId = ?",
    [observationId]
  );
  return result;
};

export const deletePhoto = async (id: number): Promise<void> => {
  const database = await getDatabase();
  await database.runAsync("DELETE FROM photos WHERE id = ?", [id]);
};

// Fungsi Update Photo
export const updatePhoto = async (
  id: number,
  photo: Partial<Photo>
): Promise<void> => {
  const fields = [];
  const values = [];
  const database = await getDatabase();
  for (const [key, value] of Object.entries(photo)) {
    if (value !== undefined && key !== "id") {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (fields.length > 0) {
    values.push(id);
    database.runAsync(
      `UPDATE photos SET ${fields.join(", ")} WHERE id = ?`,
      values
    );
  }
};
// Fungsi untuk menutup database (opsional)
export const closeDatabase = async (): Promise<void> => {
  if (databaseInstance) {
    await db.closeAsync();
    databaseInstance = null;
  }
};
