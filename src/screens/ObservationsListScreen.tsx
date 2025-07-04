import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Card, Button } from 'react-native-paper';
import { getObservations, Observation, MonitorType } from '../database/db';
import { useNavigation } from '@react-navigation/native';

const ObservationsListScreen: React.FC = () => {
    const [observations, setObservations] = useState<Observation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation();

    const loadObservations = async () => {
        setIsLoading(true);
        try {
            // In a real app, you would get the current user ID
            // console.log("loadObservations");
            const obs = await getObservations();
            // console.log(obs);
            setObservations(obs);
        } catch (error) {
            console.error('Error loading observations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', loadObservations);
        return unsubscribe;
    }, [navigation]);

     const renderItem = ({ item }: { item: Observation }) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('ObservationDetail', { observationId: item.id })}
    >
      <Card style={styles.card}>
        <Card.Title 
          title={item.reefName} 
          subtitle={`${item.location} - ${item.monitorBy}`}
        //   right={() => (
            // <IconButton 
            //   icon="delete" 
            //   onPress={(e) => {
            //     e.stopPropagation();
            //     handleDeleteObservation(item.id!);
            //   }}
            // />
        //   )}
        />
        <Card.Content>
          <Text>Lat: {item.latitude}, Long: {item.longitude}</Text>
          {item.genus && <Text>Species: {item.genus} {item.species}</Text>}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

    return (
        <View style={styles.container}>
            <FlatList
                data={observations}
                keyExtractor={item => item.id?.toString() || ''}
                refreshing={isLoading}
                onRefresh={loadObservations}
                renderItem={renderItem}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No observations yet. Create your first one!</Text>
                }
            />

            <Button 
                mode="contained" 
                onPress={() => navigation.navigate('ObservationForm')}
                style={styles.addButton}
            >
                Add Observation
            </Button>
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
        textAlign: 'center',
        marginTop: 32,
        fontSize: 16,
        color: '#666',
    },
    addButton: {
        margin: 16,
    },
});

export default ObservationsListScreen;