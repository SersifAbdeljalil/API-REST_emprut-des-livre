import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
    ActivityIndicator,
    StatusBar
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import CustomAlert from './CustomAlert'; // Adjust the path as needed

const AddBookScreen = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [description, setDescription] = useState('');
    const [publicationDate, setPublicationDate] = useState('');
    const [genre, setGenre] = useState('');
    const [locationEra, setLocationEra] = useState('');
    const [image, setImage] = useState(null);
    const [pdf, setPdf] = useState(null);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'success',
        buttons: []
    });
    const [quantity, setQuantity] = useState('1'); // Valeur par défaut: 1

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

    const pickPdf = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true
            });

            if (result && result.assets && result.assets.length > 0) {
                const pdfAsset = result.assets[0];
                if (pdfAsset.mimeType === 'application/pdf') {
                    const decodedFileName = decodeURIComponent(pdfAsset.name);
                    console.log("Nom du fichier décodé :", decodedFileName);

                    setPdf(pdfAsset.uri);
                    setAlert({
                        visible: true,
                        title: 'Succès',
                        message: `PDF sélectionné: ${decodedFileName}`,
                        type: 'success',
                        buttons: [{ text: 'OK', onPress: () => {} }]
                    });
                } else {
                    setAlert({
                        visible: true,
                        title: 'Erreur',
                        message: 'Veuillez sélectionner un fichier PDF valide',
                        type: 'error',
                        buttons: [{ text: 'OK', onPress: () => {} }]
                    });
                }
            } else {
                setAlert({
                    visible: true,
                    title: 'Erreur',
                    message: 'Aucun fichier PDF sélectionné',
                    type: 'warning',
                    buttons: [{ text: 'OK', onPress: () => {} }]
                });
            }
        } catch (err) {
            console.error('Erreur lors de la sélection du PDF:', err);
            setAlert({
                visible: true,
                title: 'Erreur',
                message: 'Une erreur est survenue lors de la sélection du PDF',
                type: 'error',
                buttons: [{ text: 'OK', onPress: () => {} }]
            });
        }
    };

    const handleSubmit = async () => {
        if (!title || !author || !description || !publicationDate || !genre || !locationEra) {
            setAlert({
                visible: true,
                title: 'Champs Incomplets',
                message: 'Veuillez remplir tous les champs requis',
                type: 'warning',
                buttons: [{ text: 'OK', onPress: () => {} }]
            });
            return;
        }

        if (!image) {
            setAlert({
                visible: true,
                title: 'Image Manquante',
                message: 'Veuillez ajouter une image de couverture',
                type: 'warning',
                buttons: [{ text: 'OK', onPress: () => {} }]
            });
            return;
        }

        if (!pdf) {
            setAlert({
                visible: true,
                title: 'PDF Manquant',
                message: 'Veuillez ajouter un fichier PDF',
                type: 'warning',
                buttons: [{ text: 'OK', onPress: () => {} }]
            });
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
        formData.append('quantity', quantity);
        if (image) {
            const imageName = image.split('/').pop();
            const imageType = 'image/' + (imageName.endsWith('png') ? 'png' : 'jpeg');

            formData.append('image', {
                uri: image,
                name: imageName,
                type: imageType,
            });
        }

        if (pdf) {
            const pdfName = pdf.split('/').pop();

            formData.append('pdf', {
                uri: pdf,
                name: pdfName,
                type: 'application/pdf',
            });
        }

        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                setAlert({
                    visible: true,
                    title: 'Non Connecté',
                    message: 'Vous devez être connecté pour ajouter un livre',
                    type: 'error',
                    buttons: [{ text: 'OK', onPress: () => {} }]
                });
                setLoading(false);
                return;
            }

            const response = await fetch('http://192.168.1.172:5000/api/books', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });

            if (response.ok) {
                setAlert({
                    visible: true,
                    title: 'Livre Ajouté',
                    message: 'Livre ajouté avec succès à la bibliothèque',
                    type: 'success',
                    buttons: [{ 
                        text: 'OK', 
                        onPress: () => {
                            navigation.goBack();
                        } 
                    }]
                });
            } else {
                const errorData = await response.json();
                setAlert({
                    visible: true,
                    title: 'Échec',
                    message: errorData.message || 'Impossible d\'ajouter le livre',
                    type: 'error',
                    buttons: [{ text: 'OK', onPress: () => {} }]
                });
            }
        } catch (error) {
            console.error('Erreur:', error);
            setAlert({
                visible: true,
                title: 'Erreur Serveur',
                message: 'Une erreur est survenue lors de l\'ajout du livre',
                type: 'error',
                buttons: [{ text: 'OK', onPress: () => {} }]
            });
        } finally {
            setLoading(false);
        }
    };

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
                <Text style={styles.headerTitle}>Ajouter un livre</Text>
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
    <Text style={styles.label}>Quantité</Text>
    <View style={styles.inputContainer}>
        <Ionicons name="list-outline" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
            style={styles.input}
            value={quantity}
            onChangeText={setQuantity}
            placeholder="Quantité disponible"
            placeholderTextColor="#999"
            keyboardType="numeric"
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

                            <View style={styles.uploadGroup}>
                                <Text style={styles.label}>Fichier PDF <Text style={styles.required}>(Obligatoire)</Text></Text>
                                {!pdf ? (
                                    <TouchableOpacity style={styles.uploadButton} onPress={pickPdf}>
                                        <LinearGradient
                                            colors={['#E53E3E', '#C53030']}
                                            style={styles.uploadGradient}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                        >
                                            <Ionicons name="document-outline" size={22} color="white" />
                                            <Text style={styles.uploadButtonText}>Sélectionner un PDF</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                ) : (
                                    <View style={styles.pdfPreview}>
                                        <View style={styles.pdfIconContainer}>
                                            <Ionicons name="document-text" size={24} color="#E53E3E" />
                                        </View>
                                        <Text style={styles.pdfName} numberOfLines={1}>
                                            {pdf.split('/').pop()}
                                        </Text>
                                        <TouchableOpacity
                                            style={styles.removePdfButton}
                                            onPress={() => setPdf(null)}
                                        >
                                            <Ionicons name="close-circle" size={22} color="#E53E3E" />
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
                                        <Ionicons name="add-circle-outline" size={20} color="white" style={styles.submitIcon} />
                                        <Text style={styles.submitButtonText}>Ajouter le livre</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* CustomAlert component */}
            <CustomAlert
                visible={alert.visible}
                title={alert.title}
                message={alert.message}
                type={alert.type}
                buttons={alert.buttons}
                onClose={() => setAlert(prev => ({ ...prev, visible: false }))}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#f6f7fb',
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
    required: {
        color: '#E53E3E',
        fontWeight: '500',
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
    pdfPreview: {
        flexDirection: 'row',
        backgroundColor: '#FFF5F5',
        padding: 12,
        borderRadius: 12,
        marginTop: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FED7D7',
    },
    pdfIconContainer: {
        backgroundColor: 'rgba(229, 62, 62, 0.1)',
        padding: 8,
        borderRadius: 8,
    },
    pdfName: {
        flex: 1,
        marginLeft: 12,
        color: '#4A5568',
        fontSize: 14,
        fontWeight: '500',
    },
    removePdfButton: {
        padding: 4,
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

export default AddBookScreen;