import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EditBookScreen = ({ route, navigation }) => {
    const { bookId } = route.params; // Récupérer l'ID du livre à modifier
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    // Récupérer les détails du livre à modifier
    useEffect(() => {
        const fetchBookDetails = async () => {
            try {
                const response = await fetch(`http://192.168.1.131:5000/api/books/${bookId}`, {
                    headers: {
                        Authorization: `Bearer ${await AsyncStorage.getItem('token')}`,
                    },
                });
                const data = await response.json();
                setTitle(data.title);
                setAuthor(data.author);
                setDescription(data.description);
                setImageUrl(data.imageUrl);
            } catch (error) {
                Alert.alert('Erreur', 'Impossible de charger les détails du livre');
            }
        };
        fetchBookDetails();
    }, [bookId]);

    const handleSubmit = async () => {
        if (!title || !author || !description) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs requis');
            return;
        }

        try {
            const response = await fetch(`http://192.168.11.102:5000/api/books/${bookId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${await AsyncStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    title,
                    author,
                    description,
                    imageUrl,
                }),
            });

            if (response.ok) {
                Alert.alert('Succès', 'Livre modifié avec succès');
                navigation.goBack();
            } else {
                Alert.alert('Erreur', 'Impossible de modifier le livre');
            }
        } catch (error) {
            Alert.alert('Erreur', 'Une erreur est survenue');
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.form}>
                <Text style={styles.label}>Titre</Text>
                <TextInput
                    style={styles.input}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Titre du livre"
                />

                <Text style={styles.label}>Auteur</Text>
                <TextInput
                    style={styles.input}
                    value={author}
                    onChangeText={setAuthor}
                    placeholder="Nom de l'auteur"
                />

                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Description du livre"
                    multiline
                    numberOfLines={4}
                />

                <Text style={styles.label}>URL de l'image</Text>
                <TextInput
                    style={styles.input}
                    value={imageUrl}
                    onChangeText={setImageUrl}
                    placeholder="URL de l'image"
                />

                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                >
                    <Text style={styles.submitButtonText}>Enregistrer les modifications</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    form: {
        padding: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        color: '#333',
    },
    input: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: '#2196F3',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 20,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default EditBookScreen;