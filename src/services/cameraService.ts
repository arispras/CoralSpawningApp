import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

export const takePhoto = async (): Promise<{ photo: string | null, error: string | null }> => {
    try {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            return { photo: null, error: 'Permission to access camera was denied' };
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
            base64: true,
        });

        if (result.canceled) {
            return { photo: null, error: 'User cancelled image picker' };
        }

        if (result.assets && result.assets.length > 0) {
            const photo = `data:image/jpeg;base64,${result.assets[0].base64}`;
            return { photo, error: null };
        }

        return { photo: null, error: 'No image selected' };
    } catch (error) {
        console.error('Error taking photo:', error);
        return { photo: null, error: 'Failed to take photo' };
    }
};

export const getCurrentLocation = async (): Promise<{ 
    latitude: number | null, 
    longitude: number | null, 
    error: string | null 
}> => {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            return { latitude: null, longitude: null, error: 'Permission to access location was denied' };
        }

        const location = await Location.getCurrentPositionAsync({});
        return { 
            latitude: location.coords.latitude, 
            longitude: location.coords.longitude, 
            error: null 
        };
    } catch (error) {
        console.error('Error getting location:', error);
        return { latitude: null, longitude: null, error: 'Failed to get location' };
    }
};