import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    Image,
    ActivityIndicator,
    StatusBar
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const EditBookScreen = ({ route, navigation }) => {
    const { bookId } = route.params;
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [description, setDescription] = useState('');
    const [publicationDate, setPublicationDate] = useState('');
    const [genre, setGenre] = useState('');
    const [locationEra, setLocationEra] = useState('');
    const [image, setImage] = useState(null);
    const [originalImage, setOriginalImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBookDetails = async () => {
            setIsLoading(true);
            try {
                const token = await AsyncStorage.getItem('token');
                if (!token) {
                    Alert.alert('Erreur', 'Vous devez être connecté pour modifier un livre');
                    navigation.goBack();
                    return;
                }

                const response = await fetch(`http://192.168.1.4:5000/api/books/${bookId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                
                if (!response.ok) {
                    throw new Error('Impossible de récupérer les détails du livre');
                }
                
                const data = await response.json();
                setTitle(data.title);
                setAuthor(data.author);
                setDescription(data.description);
                setPublicationDate(data.publication_date || '');
                setGenre(data.genre || '');
                setLocationEra(data.location_era || '');
                setImage(data.imageUrl);
                setOriginalImage(data.imageUrl);
            } catch (error) {
                console.error('Erreur lors du chargement des détails:', error);
                Alert.alert('Erreur', 'Impossible de charger les détails du livre');
                navigation.goBack();
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchBookDetails();
    }, [bookId, navigation]);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [3, 4],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri); 
        }
    };

    const handleSubmit = async () => {
        if (!title || !author || !description || !publicationDate || !genre || !locationEra) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs requis');
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('author', author);
        formData.append('description', description);
        formData.append('publication_date', publicationDate);
        formData.append('genre', genre);
        formData.append('location_era', locationEra);

        // Vérifier si l'image a été modifiée
        if (image && image !== originalImage) {
            const imageName = image.split('/').pop();
            const imageType = 'image/' + (imageName.endsWith('png') ? 'png' : 'jpeg');
            
            formData.append('image', {
                uri: image,
                name: imageName,
                type: imageType,
            });
        }

        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('Erreur', 'Vous devez être connecté pour modifier un livre');
                return;
            }

            const response = await fetch(`http://192.168.1.4:5000/api/books/${bookId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });

            if (response.ok) {
                Alert.alert('Succès', 'Livre modifié avec succès');
                navigation.goBack();
            } else {
                const errorData = await response.json();
                Alert.alert('Erreur', errorData.message || 'Impossible de modifier le livre');
            }
        } catch (error) {
            console.error('Erreur:', error);
            Alert.alert('Erreur', 'Une erreur est survenue lors de la modification du livre');
        } finally {
            setLoading(false);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4F6CE1" />
                <Text style={styles.loadingText}>Chargement des données...</Text>
            </View>
        );
    }

    return (
        <View style={styles.mainContainer}>
            <StatusBar barStyle="light-content" />
            
            {/* En-tête avec titre */}
            <LinearGradient
                colors={['#3a416f', '#141727']}
                style={styles.headerGradient}
            >
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Modifier le livre</Text>
            </LinearGradient>
            
            <ScrollView 
                style={styles.container} 
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.card}>
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Titre</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="book-outline" size={20} color="#666" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={title}
                                    onChangeText={setTitle}
                                    placeholder="Titre du livre"
                                    placeholderTextColor="#999"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Auteur</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={author}
                                    onChangeText={setAuthor}
                                    placeholder="Nom de l'auteur"
                                    placeholderTextColor="#999"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Description</Text>
                            <View style={[styles.inputContainer, styles.textAreaContainer]}>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={description}
                                    onChangeText={setDescription}
                                    placeholder="Description du livre"
                                    placeholderTextColor="#999"
                                    multiline
                                    numberOfLines={4}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Date de publication</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="calendar-outline" size={20} color="#666" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={publicationDate}
                                    onChangeText={setPublicationDate}
                                    placeholder="Date de publication (YYYY-MM-DD)"
                                    placeholderTextColor="#999"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Genre</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="pricetag-outline" size={20} color="#666" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={genre}
                                    onChangeText={setGenre}
                                    placeholder="Genre du livre"
                                    placeholderTextColor="#999"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Lieu et époque</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="location-outline" size={20} color="#666" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={locationEra}
                                    onChangeText={setLocationEra}
                                    placeholder="Lieu et époque du livre"
                                    placeholderTextColor="#999"
                                />
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.uploadSection}>
                            <Text style={styles.sectionTitle}>Média</Text>
                            
                            <View style={styles.uploadGroup}>
                                <Text style={styles.label}>Image de couverture</Text>
                                {!image ? (
                                    <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                                        <LinearGradient
                                            colors={['#4F6CE1', '#7D55F3']}
                                            style={styles.uploadGradient}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                        >
                                            <Ionicons name="image-outline" size={22} color="white" />
                                            <Text style={styles.uploadButtonText}>Sélectionner une image</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                ) : (
                                    <View style={styles.previewContainer}>
                                        <Image source={{ uri: image }} style={styles.imagePreview} />
                                        <TouchableOpacity 
                                            style={styles.removeButton}
                                            onPress={() => setImage(null)}
                                        >
                                            <Ionicons name="close-circle" size={26} color="#E53E3E" />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.submitButton, loading && styles.disabledButton]}
                            onPress={handleSubmit}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={loading ? ['#90CDF4', '#BEE3F8'] : ['#2B6CB0', '#1A365D']}
                                style={styles.submitGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <>
                                        <Ionicons name="save-outline" size={20} color="white" style={styles.submitIcon} />
                                        <Text style={styles.submitButtonText}>Enregistrer les modifications</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#f6f7fb',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f6f7fb',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#4A5568',
    },
    headerGradient: {
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
    },
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 5,
        padding: 20,
        marginBottom: 20,
    },
    form: {
        gap: 16,
    },
    inputGroup: {
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        marginBottom: 8,
        color: '#4A5568',
        fontWeight: '600',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7FAFC',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    inputIcon: {
        padding: 10,
    },
    input: {
        flex: 1,
        padding: 12,
        fontSize: 15,
        color: '#2D3748',
    },
    textAreaContainer: {
        alignItems: 'flex-start',
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    divider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginVertical: 10,
    },
    uploadSection: {
        gap: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2D3748',
        marginBottom: 10,
    },
    uploadGroup: {
        marginBottom: 16,
    },
    uploadButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    uploadGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
    },
    uploadButtonText: {
        color: 'white',
        fontSize: 16,
        marginLeft: 8,
        fontWeight: '600',
    },
    previewContainer: {
        position: 'relative',
        marginTop: 8,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    imagePreview: {
        width: '100%',
        height: 200,
        borderRadius: 12,
    },
    removeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 15,
        padding: 2,
    },
    submitButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 10,
    },
    disabledButton: {
        opacity: 0.7,
    },
    submitGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    submitIcon: {
        marginRight: 8,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default EditBookScreen;