import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  FlatList,
  Image,
} from "react-native";
import {
  Button,
  TextInput,
  RadioButton,
  HelperText,
  Card,
} from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import * as Location from "expo-location";
import { getCurrentLocation, takePhoto } from "../services/cameraService";
import {
  addObservation,
  addPhoto,
  getPhotosByObservation,
  MonitorType,
} from "../database/db";
import { Observation, Photo } from "../database/db";
import { blue } from "react-native-reanimated/lib/typescript/Colors";

interface ObservationFormProps {
  userId?: number;
  onSaveSuccess?: () => void;
}

const ObservationFormScreen: React.FC<ObservationFormProps> = ({
  userId,
  onSaveSuccess,
}) => {
  const [observation, setObservation] = useState<Partial<Observation>>({
    monitorBy: MonitorType.DIVE,
    iswitness: false,
  });
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [newPhotoDescription, setNewPhotoDescription] = useState("");

  useEffect(() => {
    // Get current location when component mounts
    const fetchLocation = async () => {
      const { latitude, longitude, error } = await getCurrentLocation();
      if (latitude && longitude) {
        setObservation((prev) => ({
          ...prev,
          latitude,
          longitude,
        }));
      } else if (error) {
        Alert.alert("Location Error", error);
      }
    };

    fetchLocation();
  }, []);

  const handleInputChange = (field: keyof Observation, value: any) => {
    setObservation((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTakePhoto = async () => {
    const { photo, error } = await takePhoto();
    if (photo) {
      // console.log(photo);
      setPhotos((prev) => [
        ...prev,
        {
          id: photos.length,
          description: newPhotoDescription,
          photo,
          observationId: 0, // Will be updated after observation is saved
        },
      ]);
      setNewPhotoDescription("");
    } else if (error) {
      Alert.alert("Camera Error", error);
    }
  };

  const handleSaveObservation = async () => {
    // Validate required fields
    const newErrors: Record<string, string> = {};
    if (!observation.location) newErrors.location = "Location is required";
    if (!observation.reefName) newErrors.reefName = "Reef name is required";
    if (!observation.latitude) newErrors.latitude = "Latitude is required";
    if (!observation.longitude) newErrors.longitude = "Longitude is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    try {
      // Save observation
      const observationId = await addObservation({
        ...observation,
        userId,
      } as Observation);

      // Save photos
      for (const photo of photos) {
        // console.log("photo:" + photo);
        await addPhoto({
          ...photo,
          observationId,
        });
      }

      Alert.alert("Success", "Observation saved successfully");
      if (onSaveSuccess) onSaveSuccess();
    } catch (error) {
      console.error("Error saving observation:", error);
      Alert.alert("Error", "Failed to save observation");
    } finally {
      setIsLoading(false);
    }
  };
  const renderPhoto = ({ item }: { item: Photo }) => (
    <View style={styles.photosContainer}>
      <Image
        source={{ uri: item.photo }}
        style={styles.photoImage}
        resizeMode="contain"
      />
      <TextInput
        label="Photo Description"
        onChangeText={(text) => {
          setPhotos((prev) =>
            prev.map((p) =>
              p.id === item.id ? { ...p, description: text } : p
            )
          );
        }}
        value={item.description}
        multiline
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>New Observation</Text>

      <TextInput
        label="Email"
        value={observation.email || ""}
        onChangeText={(text) => handleInputChange("email", text)}
        keyboardType="email-address"
        style={styles.input}
      />

      <TextInput
        label="Location*"
        value={observation.location || ""}
        onChangeText={(text) => handleInputChange("location", text)}
        style={styles.input}
        error={!!errors.location}
      />
      <HelperText type="error" visible={!!errors.location}>
        {errors.location}
      </HelperText>

      <TextInput
        label="Reef Name*"
        value={observation.reefName || ""}
        onChangeText={(text) => handleInputChange("reefName", text)}
        style={styles.input}
        error={!!errors.reefName}
      />
      <HelperText type="error" visible={!!errors.reefName}>
        {errors.reefName}
      </HelperText>

      <View style={styles.row}>
        <TextInput
          label="Latitude*"
          value={observation.latitude?.toString() || ""}
          onChangeText={(text) =>
            handleInputChange("latitude", parseFloat(text))
          }
          keyboardType="numeric"
          style={[styles.input, styles.halfInput]}
          error={!!errors.latitude}
        />
        <TextInput
          label="Longitude*"
          value={observation.longitude?.toString() || ""}
          onChangeText={(text) =>
            handleInputChange("longitude", parseFloat(text))
          }
          keyboardType="numeric"
          style={[styles.input, styles.halfInput]}
          error={!!errors.longitude}
        />
      </View>
      <HelperText
        type="error"
        visible={!!errors.latitude || !!errors.longitude}
      >
        {errors.latitude || errors.longitude}
      </HelperText>

      <Text style={styles.sectionTitle}>Monitoring Method*</Text>
      <Picker
        selectedValue={observation.monitorBy}
        onValueChange={(value) => handleInputChange("monitorBy", value)}
        style={styles.picker}
      >
        {Object.values(MonitorType).map((type) => (
          <Picker.Item key={type} label={type} value={type} />
        ))}
      </Picker>

      <Text style={styles.sectionTitle}>Species Information</Text>
      <TextInput
        label="Genus"
        value={observation.genus || ""}
        onChangeText={(text) => handleInputChange("genus", text)}
        style={styles.input}
      />
      <TextInput
        label="Species"
        value={observation.species || ""}
        onChangeText={(text) => handleInputChange("species", text)}
        style={styles.input}
      />

      <Text style={styles.sectionTitle}>Photos:{photos.length}</Text>
      {/* <TextInput
        label="Photo Description"
        value={newPhotoDescription}
        onChangeText={setNewPhotoDescription}
        style={styles.input}
      /> */}
      <Button mode="contained" onPress={handleTakePhoto} style={styles.buttonTakePhoto}>
        Add/Take Photo
      </Button>

      {photos.length > 0 && (
        <View style={styles.photosContainer}>
          {/* <Text>Total Photos: {photos.length}</Text> */}
          {/* Here you would display thumbnails of the photos */}
          <FlatList
            data={photos}
            //     keyExtractor={(photo) =>
            //     item.id?.toString() || Math.random().toString()
            //   }
            scrollEnabled={false}
            renderItem={renderPhoto}
          />
        </View>
      )}

      <Button
        mode="contained"
        onPress={handleSaveObservation}
        style={styles.saveButton}
        loading={isLoading}
        disabled={isLoading}
      >
        Save Observation
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    marginBottom: 8,
  },
  halfInput: {
    flex: 1,
    marginRight: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  picker: {
    marginBottom: 16,
  },
  button: {
    marginVertical: 8,
  },
   buttonTakePhoto: {
    marginVertical: 8,
    backgroundColor:"green"   
  },
  saveButton: {
    marginTop: 24,
    marginBottom: 32,
  },
  photosContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  photoCard: {
    marginBottom: 16,
  },
  photoImage: {
    width: "100%",
    height: 200,
  },
  photoDescription: {
    marginTop: 8,
  },
});

export default ObservationFormScreen;
