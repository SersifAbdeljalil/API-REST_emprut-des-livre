import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
    StatusBar,
    ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const BookDetailsScreen = ({ route, navigation }) => {
    const { bookId } = route.params;
    const [book, setBook] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Charger les détails du livre
    useEffect(() => {
        const fetchBookDetails = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`http://192.168.11.119:5000/api/books/${bookId}`, {
                    headers: {
                        Authorization: `Bearer ${await AsyncStorage.getItem('token')}`,
                    },
                });
                const data = await response.json();
                console.log("Réponse de l'API :", data); // Ajoutez ce log
                const updatedBook = {
                    ...data,
                    imageUrl: `http://192.168.11.119:5000/${data.image_url.replace("\\", "/")}`,
                    pdfUrl: `http://192.168.11.119:5000/${data.pdf_url.replace("\\", "/")}`,
                };
                setBook(updatedBook);
                setIsLoading(false);
            } catch (error) {
                Alert.alert('Erreur', 'Impossible de charger les détails du livre');
                setIsLoading(false);
            }
        };
        fetchBookDetails();
    }, [bookId]);

    const handleDelete = async () => {
        Alert.alert(
            'Confirmation',
            'Êtes-vous sûr de vouloir supprimer ce livre ?',
            [
                {
                    text: 'Annuler',
                    style: 'cancel',
                },
                {
                    text: 'Supprimer',
                    onPress: async () => {
                        try {
                            setIsLoading(true);
                            const response = await fetch(`http://192.168.1.4:5000/api/books/${bookId}`, {
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
                                setIsLoading(false);
                            }
                        } catch (error) {
                            Alert.alert('Erreur', 'Une erreur est survenue');
                            setIsLoading(false);
                        }
                    },
                    style: 'destructive',
                },
            ],
            { cancelable: true }
        );
    };

    const handleDownloadPdf = async () => {
        if (!book?.pdfUrl) {
            Alert.alert('Erreur', "Ce livre n'a pas de PDF disponible");
            return;
        }
        try {
            setIsLoading(true);
            const fileUri = FileSystem.documentDirectory + book.title.replace(/\s+/g, '_') + '.pdf';
            const { uri } = await FileSystem.downloadAsync(book.pdfUrl, fileUri);
            setIsLoading(false);
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri);
            } else {
                Alert.alert('Succès', 'PDF téléchargé', [{ text: 'OK' }]);
            }
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de télécharger le PDF');
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4F6CE1" />
                <Text style={styles.loadingText}>Chargement...</Text>
            </View>
        );
    }

    if (!book) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={50} color="#E53E3E" />
                <Text style={styles.errorText}>Impossible de charger les détails du livre</Text>
                <TouchableOpacity 
                    style={styles.errorButton}
                    onPress={() => navigation.goBack()}
                >
                    <LinearGradient
                        colors={['#4F6CE1', '#7D55F3']}
                        style={styles.errorButtonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Text style={styles.errorButtonText}>Retour</Text>
                    </LinearGradient>
                </TouchableOpacity>
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
                <Text style={styles.headerTitle}>Détails du livre</Text>
            </LinearGradient>
            
            <ScrollView 
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.card}>
                    <View style={styles.imageSection}>
                        <Image source={{ uri: book.imageUrl }} style={styles.coverImage} />
                    </View>
                    
                    <View style={styles.infoSection}>
                        <Text style={styles.bookTitle}>{book.title}</Text>
                        
                        <View style={styles.authorRow}>
                            <Ionicons name="person-outline" size={20} color="#666" style={styles.authorIcon} />
                            <Text style={styles.authorName}>{book.author}</Text>
                        </View>
                        
                        <View style={styles.divider} />
                        
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.descriptionText}>{book.description}</Text>

                        {/* Nouveaux champs ajoutés ici */}
                        <Text style={styles.sectionTitle}>Date de publication</Text>
                        <Text style={styles.descriptionText}>{book.publication_date}</Text>

                        <Text style={styles.sectionTitle}>Genre</Text>
                        <Text style={styles.descriptionText}>{book.genre}</Text>

                        <Text style={styles.sectionTitle}>Lieu et époque</Text>
                        <Text style={styles.descriptionText}>{book.location_era}</Text>
                        <Text style={styles.sectionTitle}>Quantité disponible</Text>
<View style={styles.quantityContainer}>
    <Ionicons name="list-outline" size={20} color="#666" style={styles.quantityIcon} />
    <Text style={styles.quantityText}>{book.quantity || 1}</Text>
</View>
                        <View style={styles.actionsSection}>
                            <TouchableOpacity 
                                style={styles.actionButton}
                                onPress={() => navigation.navigate('EditBook', { bookId: book.id })}
                            >
                                <LinearGradient
                                    colors={['#4F6CE1', '#7D55F3']}
                                    style={styles.actionGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    <Ionicons name="create-outline" size={22} color="white" />
                                    <Text style={styles.actionText}>Modifier</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            
                            {book.pdfUrl && (
                                <TouchableOpacity 
                                    style={styles.actionButton}
                                    onPress={handleDownloadPdf}
                                >
                                    <LinearGradient
                                        colors={['#2B6CB0', '#1A365D']}
                                        style={styles.actionGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    >
                                        <Ionicons name="document-outline" size={22} color="white" />
                                        <Text style={styles.actionText}>Télécharger PDF</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            )}
                            
                            <TouchableOpacity 
                                style={styles.actionButton}
                                onPress={handleDelete}
                            >
                                <LinearGradient
                                    colors={['#E53E3E', '#C53030']}
                                    style={styles.actionGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    <Ionicons name="trash-outline" size={22} color="white" />
                                    <Text style={styles.actionText}>Supprimer</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
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
        overflow: 'hidden',
        marginBottom: 20,
    },
    imageSection: {
        height: 250,
        width: '100%',
        backgroundColor: '#f0f2f5',
    },
    coverImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    infoSection: {
        padding: 20,
    },
    bookTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2D3748',
        marginBottom: 10,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    authorIcon: {
        marginRight: 8,
    },
    authorName: {
        fontSize: 16,
        color: '#4A5568',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginVertical: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2D3748',
        marginBottom: 10,
    },
    descriptionText: {
        fontSize: 15,
        lineHeight: 22,
        color: '#4A5568',
        marginBottom: 20,
    },
    actionsSection: {
        marginTop: 10,
        gap: 12,
    },
    actionButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    actionGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
    },
    actionText: {
        color: 'white',
        fontSize: 16,
        marginLeft: 8,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f6f7fb',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#4A5568',
        fontWeight: '500',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f6f7fb',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        color: '#4A5568',
        textAlign: 'center',
        marginVertical: 20,
        fontWeight: '500',
    },
    errorButton: {
        borderRadius: 12,
        overflow: 'hidden',
        width: '60%',
        marginTop: 20,
    },
    errorButtonGradient: {
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7FAFC',
        borderRadius: 10,
        padding: 12,
        marginBottom: 20,
    },
    quantityIcon: {
        marginRight: 10,
    },
    quantityText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4A5568',
    },
});

export default BookDetailsScreen;