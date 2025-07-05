import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import {
  Card,
  Button,
  IconButton,
  Searchbar,
  Modal,
  Portal,
} from "react-native-paper";
import { getObservations, Observation, MonitorType } from "../database/db";
import { useNavigation } from "@react-navigation/native";
import OSMMap from "./OSMMap";
import { StackNavigationProp } from "@react-navigation/stack";

type RootStackParamList = {
  "ObservationForm": undefined; // jika tidak ada params
  "ObservationDetail": { observationId:number|undefined };
};

const ObservationsListScreen: React.FC = () => {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // const navigation = useNavigation();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredObservations, setFilteredObservations] = useState<
    Observation[]
  >([]);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [mapVisible, setMapVisible] = useState(false);
  const loadObservations = async () => {
    setIsLoading(true);
    try {
      const obs = await getObservations();
      setObservations(obs);
      setFilteredObservations(obs); // Initialize filtered list with all observations
    } catch (error) {
      console.error("Error loading observations:", error);
    } finally {
      setIsLoading(false);
    }
  };
  // Filter observations based on search query
  const filterObservations = (query: string) => {
    if (query === "") {
      setFilteredObservations(observations);
      return;
    }

    const lowerCaseQuery = query.toLowerCase();
    // console.log(lowerCaseQuery);
    const filtered = observations.filter((obs) => {
      return (
        obs.location.toLowerCase().includes(lowerCaseQuery) ||
        obs.reefName.toLowerCase().includes(lowerCaseQuery) ||
        obs.monitorBy.toLowerCase().includes(lowerCaseQuery) ||
        (obs.genus && obs.genus.toLowerCase().includes(lowerCaseQuery)) ||
        (obs.species && obs.species.toLowerCase().includes(lowerCaseQuery))
      );
    });
    // console.log(filtered);
    setFilteredObservations(filtered);
  };
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadObservations);
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    filterObservations(searchQuery);
  }, [searchQuery, observations]);

  const showLocationOnMap = (latitude: number, longitude: number) => {
    setSelectedLocation({ latitude, longitude });
    setMapVisible(true);
  };
  const renderItem = ({ item }: { item: Observation }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("ObservationDetail", { observationId: item.id })
      }
    >
      <Card style={styles.card}>
        <Card.Title
          title={item.reefName}
          subtitle={`${item.location} - ${item.monitorBy}`}
          right={() => (
            <IconButton
              icon="map"
              onPress={(e) => {
                e.stopPropagation();
                showLocationOnMap(item.latitude, item.longitude);
              }}
              style={styles.mapButton}
            />
          )}
        />

        <Card.Content>
          <Text>
            Lat: {item.latitude}, Long: {item.longitude}
          </Text>
          {item.genus && (
            <Text>
              Species: {item.genus} {item.species}
            </Text>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search by location, reef, or method..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        inputStyle={styles.searchInput}
        iconColor="#6200ee"
        clearIcon="close-circle"
        onClearIconPress={() => setSearchQuery("")}
      />

      <FlatList
        data={filteredObservations}
        keyExtractor={(item) => item.id?.toString() || ""}
        refreshing={isLoading}
        onRefresh={loadObservations}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No observations yet. Create your first one!
          </Text>
        }
      />

      <Button
        mode="contained"
        onPress={() => navigation.navigate("ObservationForm")}
        style={styles.addButton}
        labelStyle={styles.addButtonLabel}
      >
        Add Observation
      </Button>
      <Portal>
        <Modal
          visible={mapVisible}
          onDismiss={() => setMapVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedLocation && (
            <View style={styles.mapContainer}>
              <OSMMap
                latitude={selectedLocation.latitude}
                longitude={selectedLocation.longitude}
              />
              <Button
                mode="contained"
                onPress={() => setMapVisible(false)}
                style={styles.closeMapButton}
              >
                Close Map
              </Button>
            </View>
          )}
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 32,
    fontSize: 16,
    color: "#666",
  },
  addButton: {
    margin: 16,
    borderRadius: 8,
    paddingVertical: 8,
    backgroundColor: "#6200ee",
  },
  addButtonLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  searchBar: {
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
    backgroundColor: "white",
  },
  searchInput: {
    fontSize: 14,
  },
  mapContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  modalContainer: {
    backgroundColor: "white",
    padding: 0,
    margin: 20,
    borderRadius: 10,
    height: Dimensions.get("window").height * 0.8,
    width: Dimensions.get("window").width - 40,
    overflow: "hidden",
  },
  closeMapButton: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    borderRadius: 8,
    paddingVertical: 8,
    backgroundColor: "#6200ee",
  },
  mapButton: {
    marginRight: 8,
  },
});

export default ObservationsListScreen;
