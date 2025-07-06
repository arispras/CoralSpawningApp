export enum MonitorType {
  DIVE = 'DIVE',
  TRAP = 'TRAP',
  CAMERA = 'CAMERA',
  OTHER = 'OTHER'
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
  isWitness: boolean;
  spawningDate?: string;
  deployedDate?: string;
  recoverDate?: string;
  diveDate?: string;
  diveStartTime?: string;
  spawnTime?: string;
  colonyCount?: number;
  maxDepth?: number;
  userId?: string;
  is_synced?: boolean;
}

export interface Photo {
  id?: number;
  observationId: number;
  description?: string;
  photoUri?: string;
  photo_path?: string;
  is_synced?: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  token?: string;
}

export interface AuthContextType {
  isAppReady: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export interface ObservationFormProps {
  observation?: Observation;
  onSubmit: (data: Observation) => void;
  onCancel: () => void;
}

export interface PhotoListProps {
  observationId: number;
  photos: Photo[];
  onPhotosChange: (photos: Photo[]) => void;
}

export interface ObservationsScreenProps {
  navigation: any;
}

export interface ObservationDetailScreenProps {
  route: any;
  navigation: any;
}

export interface ObservationEditScreenProps {
  route: any;
  navigation: any;
}