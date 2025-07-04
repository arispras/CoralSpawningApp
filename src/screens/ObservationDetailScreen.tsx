import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  FlatList,
} from "react-native";
import {
  Button,
  Card,
  IconButton,
  Modal,
  TextInput,
  RadioButton,
  HelperText,
} from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  Observation,
  Photo,
  MonitorType,
  getObservation,
  getPhotosByObservation,
  updateObservation,
  deleteObservation,
  addPhoto,
  updatePhoto,
  deletePhoto,
} from "../database/db";
import { takePhoto } from "../services/cameraService";

const ObservationDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { observationId } = route.params as { observationId: number };

  const [observation, setObservation] = useState<Observation | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [tempObservation, setTempObservation] = useState<Partial<Observation>>(
    {}
  );
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState<Photo | null>(null);
  const [newPhotoDescription, setNewPhotoDescription] = useState("");

  useEffect(() => {
    loadData();
  }, [observationId]);

  const loadData = async () => {
    try {
      const obs = await getObservation(observationId);
      const phs = await getPhotosByObservation(observationId);
      setObservation(obs || null);
      setPhotos(phs);
      setTempObservation(obs || {});
    } catch (error) {
      Alert.alert("Error", "Failed to load observation details");
    }
  };

  const handleTakePhoto = async () => {
    const { photo, error } = await takePhoto();
    if (photo) {
      setCurrentPhoto({
        id: 0,
        description: newPhotoDescription,
        photo,
        observationId,
      });
      setPhotoModalVisible(true);
      setNewPhotoDescription("");
    } else if (error) {
      Alert.alert("Camera Error", error);
    }
  };

  const handleAddPhoto = async () => {
    if (!currentPhoto) return;

    try {
      const photoId = await addPhoto(currentPhoto);
      setPhotos((prev) => [...prev, { ...currentPhoto, id: photoId }]);
      setPhotoModalVisible(false);
      setCurrentPhoto(null);
      Alert.alert("Success", "Photo added successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to add photo");
    }
  };

  const handleUpdatePhoto = async () => {
    if (!currentPhoto?.id) return;

    try {
      await updatePhoto(currentPhoto.id, {
        description: currentPhoto.description,
      });
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === currentPhoto.id
            ? { ...p, description: currentPhoto.description }
            : p
        )
      );
      setPhotoModalVisible(false);
      setCurrentPhoto(null);
      Alert.alert("Success", "Photo updated successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to update photo");
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this photo?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePhoto(photoId);
              setPhotos((prev) => prev.filter((p) => p.id !== photoId));
              Alert.alert("Success", "Photo deleted successfully");
            } catch (error) {
              Alert.alert("Error", "Failed to delete photo");
            }
          },
        },
      ]
    );
  };

  const handleUpdateObservation = async () => {
    try {
      await updateObservation(observationId, tempObservation);
      setObservation((prev) => ({ ...prev!, ...tempObservation }));
      setEditMode(false);
      Alert.alert("Success", "Observation updated successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to update observation");
    }
  };

  const handleDeleteObservation = async () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this observation?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteObservation(observationId);
              navigation.goBack();
              Alert.alert("Success", "Observation deleted successfully");
            } catch (error) {
              Alert.alert("Error", "Failed to delete observation");
            }
          },
        },
      ]
    );
  };

  if (!observation) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{observation.reefName}</Text>
        <IconButton
          icon={editMode ? "close" : "pencil"}
          onPress={() => setEditMode(!editMode)}
        />
      </View>

      {editMode ? (
        <View style={styles.editContainer}>
          <TextInput
            label="Email"
            value={tempObservation.email || ""}
            onChangeText={(text) =>
              setTempObservation((prev) => ({ ...prev, email: text }))
            }
            keyboardType="email-address"
            style={styles.input}
          />

          <TextInput
            label="Location"
            value={tempObservation.location || ""}
            onChangeText={(text) =>
              setTempObservation((prev) => ({ ...prev, location: text }))
            }
            style={styles.input}
          />

          <TextInput
            label="Reef Name"
            value={tempObservation.reefName || ""}
            onChangeText={(text) =>
              setTempObservation((prev) => ({ ...prev, reefName: text }))
            }
            style={styles.input}
          />

          <View style={styles.row}>
            <TextInput
              label="Latitude"
              value={tempObservation.latitude?.toString() || ""}
              onChangeText={(text) =>
                setTempObservation((prev) => ({
                  ...prev,
                  latitude: parseFloat(text),
                }))
              }
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
            />
            <TextInput
              label="Longitude"
              value={tempObservation.longitude?.toString() || ""}
              onChangeText={(text) =>
                setTempObservation((prev) => ({
                  ...prev,
                  longitude: parseFloat(text),
                }))
              }
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
            />
          </View>

          <Text style={styles.sectionTitle}>Monitoring Method</Text>
          <View style={styles.radioGroup}>
            {Object.values(MonitorType).map((type) => (
              <View key={type} style={styles.radioItem}>
                <RadioButton
                  value={type}
                  status={
                    tempObservation.monitorBy === type ? "checked" : "unchecked"
                  }
                  onPress={() =>
                    setTempObservation((prev) => ({ ...prev, monitorBy: type }))
                  }
                />
                <Text>{type}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Species Information</Text>
          <TextInput
            label="Genus"
            value={tempObservation.genus || ""}
            onChangeText={(text) =>
              setTempObservation((prev) => ({ ...prev, genus: text }))
            }
            style={styles.input}
          />
          <TextInput
            label="Species"
            value={tempObservation.species || ""}
            onChangeText={(text) =>
              setTempObservation((prev) => ({ ...prev, species: text }))
            }
            style={styles.input}
          />

          <View style={styles.buttonRow}>
            <Button
              mode="outlined"
              onPress={() => setEditMode(false)}
              style={styles.button}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleUpdateObservation}
              style={styles.button}
            >
              Save Changes
            </Button>
          </View>

          <Button
            mode="contained"
            buttonColor="red"
            onPress={handleDeleteObservation}
            style={styles.deleteButton}
          >
            Delete Observation
          </Button>
        </View>
      ) : (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.label}>Email: {observation.email}</Text>
            <Text style={styles.label}>Location: {observation.location}</Text>
            <Text style={styles.label}>Reef Name: {observation.reefName}</Text>
            <Text style={styles.label}>
              Coordinates: {observation.latitude}, {observation.longitude}
            </Text>
            <Text style={styles.label}>
              Monitoring Method: {observation.monitorBy}
            </Text>
            {observation.genus && (
              <Text style={styles.label}>
                Species: {observation.genus} {observation.species}
              </Text>
            )}
            {observation.comment && (
              <Text style={styles.label}>Comment: {observation.comment}</Text>
            )}
          </Card.Content>
        </Card>
      )}

      <Text style={styles.sectionTitle}>Photos ({photos.length})</Text>

      {editMode && (
        <View style={styles.addPhotoContainer}>
          {/* <TextInput
            label="Photo Description"
            value={newPhotoDescription}
            onChangeText={setNewPhotoDescription}
            style={styles.input}
          /> */}
          <Button
            mode="contained"
            onPress={handleTakePhoto}
            style={styles.buttonAddPhoto}
            icon="camera"
          >
            Add New Photo
          </Button>
        </View>
      )}

      {photos.length === 0 ? (
        <Text style={styles.emptyText}>No photos available</Text>
      ) : (
        <FlatList
          data={photos}
          keyExtractor={(item) =>
            item.id?.toString() || Math.random().toString()
          }
          scrollEnabled={false}
          renderItem={({ item }) => (
            <Card style={styles.photoCard}>
              <Image
                source={{ uri: item.photo }}
                style={styles.photoImage}
                resizeMode="contain"
              />
              {editMode ? (
                <Card.Content>
                  <TextInput
                    label="Description"
                    value={item.description}
                    onChangeText={(text) => {
                      setPhotos((prev) =>
                        prev.map((p) =>
                          p.id === item.id ? { ...p, description: text } : p
                        )
                      );
                    }}
                    style={styles.input}
                    multiline
                  />
                  <Button
                    mode="contained"
                    onPress={() => {
                      setCurrentPhoto(item);
                      handleUpdatePhoto();
                    }}
                    style={styles.button}
                  >
                    Update Description
                  </Button>
                  <Button
                    mode="outlined"
                    buttonColor="red"
                    onPress={() => item.id && handleDeletePhoto(item.id)}
                    style={styles.button}
                  >
                    Delete Photo
                  </Button>
                </Card.Content>
              ) : (
                <Card.Content>
                  <Text style={styles.photoDescription}>
                    {item.description || "No description"}
                  </Text>
                </Card.Content>
              )}
            </Card>
          )}
        />
      )}

      {/* Photo Preview Modal */}
      <Modal
        visible={photoModalVisible}
        onDismiss={() => setPhotoModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.card}>
          {currentPhoto && (
            <>
              <Image
                source={{ uri: currentPhoto.photo }}
                style={styles.modalPhoto}
                resizeMode="contain"
              />
              <TextInput
                label="Photo Description"
                value={currentPhoto.description}
                onChangeText={(text) =>
                  setCurrentPhoto((prev) => ({ ...prev!, description: text }))
                }
                style={styles.input}
                multiline
              />
              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setPhotoModalVisible(false)}
                  style={styles.button}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={currentPhoto.id ? handleUpdatePhoto : handleAddPhoto}
                  style={styles.button}
                >
                  {currentPhoto.id ? "Update" : "Save"} Photo
                </Button>
              </View>
            </>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  card: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  editContainer: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    flex: 1,
    marginRight: 8,
  },
  radioGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  buttonAddPhoto: {
    flex: 1,
    marginHorizontal: 4,
    marginBottom: 8,
    backgroundColor:'green'
  },
  deleteButton: {
    marginTop: 8,
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
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginVertical: 16,
  },
  addPhotoContainer: {
    marginBottom: 16,
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalPhoto: {
    width: "100%",
    height: 200,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
});

export default ObservationDetailScreen;
