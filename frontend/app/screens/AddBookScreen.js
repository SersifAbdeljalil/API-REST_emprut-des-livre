import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddBookScreen = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.cancelled) {
            setImage(result.uri);
        }
    };

    const handleSubmit = async () => {
        if (!title || !author || !description) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs requis');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('author', author);
        formData.append('description', description);
        if (image) {
            formData.append('image', {
                uri: image,
                name: 'photo.jpg',
                type: 'image/jpeg',
            });
        }

        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch('http://192.168.11.102:5000/api/books', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });

            if (response.ok) {
                Alert.alert('Succès', 'Livre ajouté avec succès');
                navigation.goBack();
            } else {
                Alert.alert('Erreur', 'Impossible d\'ajouter le livre');
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

                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                    <Text style={styles.imagePickerText}>Choisir une image</Text>
                </TouchableOpacity>

                {image && <Image source={{ uri: image }} style={styles.imagePreview} />}

                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                >
                    <Text style={styles.submitButtonText}>Ajouter le livre</Text>
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
    imagePicker: {
        backgroundColor: '#2196F3',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 15,
    },
    imagePickerText: {
        color: 'white',
        fontSize: 16,
    },
    imagePreview: {
        width: '100%',
        height: 200,
        borderRadius: 5,
        marginBottom: 15,
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

export default AddBookScreen;