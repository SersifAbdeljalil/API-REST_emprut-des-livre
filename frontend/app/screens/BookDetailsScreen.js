import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BookDetailsScreen = ({ route, navigation }) => {
    const { bookId } = route.params; // Récupérer l'ID du livre
    const [book, setBook] = useState(null);

    // Récupérer les détails du livre
    useEffect(() => {
        const fetchBookDetails = async () => {
            try {
                const response = await fetch(`http://192.168.11.102:5000/api/books/${bookId}`, {
                    headers: {
                        Authorization: `Bearer ${await AsyncStorage.getItem('token')}`,
                    },
                });
                const data = await response.json();
                setBook(data);
            } catch (error) {
                Alert.alert('Erreur', 'Impossible de charger les détails du livre');
            }
        };
        fetchBookDetails();
    }, [bookId]);

    const handleDelete = async () => {
        try {
            const response = await fetch(`http://192.168.1.131:5000/api/books/${bookId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${await AsyncStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                Alert.alert('Succès', 'Livre supprimé avec succès');
                navigation.goBack();
            } else {
                Alert.alert('Erreur', 'Impossible de supprimer le livre');
            }
        } catch (error) {
            Alert.alert('Erreur', 'Une erreur est survenue');
        }
    };

    if (!book) {
        return (
            <View style={styles.container}>
                <Text>Chargement...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Image source={{ uri: book.imageUrl }} style={styles.image} />
            <Text style={styles.title}>{book.title}</Text>
            <Text style={styles.author}>Par {book.author}</Text>
            <Text style={styles.description}>{book.description}</Text>

            <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigation.navigate('EditBook', { bookId: book.id })}
            >
                <Text style={styles.buttonText}>Modifier</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
            >
                <Text style={styles.buttonText}>Supprimer</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    image: {
        width: '100%',
        height: 300,
        borderRadius: 10,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    author: {
        fontSize: 18,
        color: '#666',
        marginBottom: 20,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 20,
    },
    editButton: {
        backgroundColor: '#2196F3',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 10,
    },
    deleteButton: {
        backgroundColor: '#f44336',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default BookDetailsScreen;