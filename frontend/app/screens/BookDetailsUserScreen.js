import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    Image, 
    ScrollView, 
    TouchableOpacity, 
    ActivityIndicator, 
    Alert, 
    StatusBar,
    StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BookDetailsScreenUser = ({ route, navigation }) => {
    // Vérifier si route.params existe et extraire bookId en toute sécurité
    const bookId = route?.params?.bookId;
    const [book, setBook] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [borrowStatus, setBorrowStatus] = useState(null);
    
    useEffect(() => {
        if (!bookId) {
            setIsLoading(false);
            return;
        }

        const fetchBookDetails = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`http://192.168.11.119:5000/api/books/${bookId}`, {
                    headers: {
                        Authorization: `Bearer ${await AsyncStorage.getItem('token')}`,
                    },
                });
                const data = await response.json();

                const updatedBook = {
                    ...data,
                    imageUrl: `http://192.168.11.119:5000/${data.image_url.replace("\\", "/")}`,
                    pdfUrl: data.pdf_url ? `http://192.168.11.119:5000/${data.pdf_url.replace("\\", "/")}` : null,
                };
                setBook(updatedBook);
                const userId = await AsyncStorage.getItem('userId');
                const borrowResponse = await fetch(`http://192.168.11.119:5000/api/borrows/status?bookId=${bookId}&userId=${userId}`, {
                    headers: {
                        Authorization: `Bearer ${await AsyncStorage.getItem('token')}`,
                    },
                });
                
                if (borrowResponse.ok) {
                    const borrowData = await borrowResponse.json();
                    setBorrowStatus(borrowData.status || null);
                }
                
                setIsLoading(false);
            } catch (error) {
                console.error("Erreur lors du chargement:", error);
                Alert.alert('Erreur', 'Impossible de charger les détails du livre');
                setIsLoading(false);
            }
        };
        fetchBookDetails();
    }, [bookId]);

    const handleBorrowRequest = async () => {
        if (!bookId) {
            Alert.alert('Erreur', 'Identifiant du livre manquant');
            return;
        }

        // Vérifier si le livre est disponible en quantité suffisante
        if (book.quantity <= 0 && borrowStatus !== 'borrowed') {
            Alert.alert('Livre indisponible', 'Ce livre n\'est actuellement pas disponible en stock.');
            return;
        }
    
        try {
            setIsLoading(true);
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                Alert.alert('Erreur', 'Utilisateur non identifié');
                setIsLoading(false);
                return;
            }
    
            console.log("User ID from AsyncStorage:", userId);
    
            if (borrowStatus === 'borrowed') {
                const response = await fetch(`http://192.168.11.119:5000/api/borrows/return`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${await AsyncStorage.getItem('token')}`,
                    },
                    body: JSON.stringify({
                        bookId: bookId,
                        userId: userId
                    }),
                });
    
                if (response.ok) {
                    Alert.alert('Succès', 'Livre retourné avec succès');
                    setBorrowStatus(null);
                    // Mettre à jour la quantité affichée localement
                    setBook(prev => ({
                        ...prev,
                        quantity: (prev.quantity || 0) + 1
                    }));
                } else {
                    const errorData = await response.json();
                    Alert.alert('Erreur', errorData.message || 'Impossible de retourner le livre');
                }
            } else {
                // Emprunter un livre
                const response = await fetch(`http://192.168.11.119:5000/api/borrows/request`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${await AsyncStorage.getItem('token')}`,
                    },
                    body: JSON.stringify({
                        bookId: bookId,
                        userId: userId
                    }),
                });
    
                if (response.ok) {
                    Alert.alert('Succès', 'Demande d\'emprunt envoyée avec succès');
                    setBorrowStatus('pending');
                } else {
                    const errorData = await response.json();
                    Alert.alert('Erreur', errorData.message || 'Impossible d\'envoyer la demande d\'emprunt');
                }
            }
            
            setIsLoading(false);
        } catch (error) {
            console.error("Erreur lors de la requête d'emprunt:", error);
            Alert.alert('Erreur', 'Une erreur est survenue lors de la demande');
            setIsLoading(false);
        }
    };
    
    const renderActionButton = () => {
        let buttonText = '';
        let buttonColors = ['#4F6CE1', '#7D55F3'];
        let isDisabled = false;

        // Vérifier la quantité
        const isOutOfStock = (book.quantity <= 0);

        switch (borrowStatus) {
            case 'pending':
                buttonText = 'Demande en cours...';
                buttonColors = ['#A0AEC0', '#718096'];
                isDisabled = true;
                break;
            case 'approved':
                buttonText = 'Demande approuvée - À récupérer';
                buttonColors = ['#38A169', '#2F855A'];
                isDisabled = true;
                break;
            case 'borrowed':
                buttonText = 'Rendre ce livre';
                buttonColors = ['#DD6B20', '#C05621'];
                break;
            default:
                buttonText = isOutOfStock ? 'Indisponible en stock' : 'Emprunter ce livre';
                buttonColors = isOutOfStock ? ['#A0AEC0', '#718096'] : ['#4F6CE1', '#7D55F3'];
                isDisabled = isOutOfStock;
                break;
        }

        return (
            <TouchableOpacity 
                style={[styles.actionButton, isDisabled && styles.disabledButton]}
                onPress={handleBorrowRequest}
                disabled={isDisabled}
            >
                <LinearGradient
                    colors={buttonColors}
                    style={styles.actionGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <Ionicons 
                        name={borrowStatus === 'borrowed' ? "return-down-back-outline" : 
                              isOutOfStock ? "alert-circle-outline" : "book-outline"} 
                        size={22} 
                        color="white" 
                    />
                    <Text style={styles.actionText}>{buttonText}</Text>
                </LinearGradient>
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4F6CE1" />
                <Text style={styles.loadingText}>Chargement...</Text>
            </View>
        );
    }

    // Si bookId n'est pas défini, afficher un message d'erreur
    if (!bookId) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={50} color="#E53E3E" />
                <Text style={styles.errorText}>Identifiant du livre manquant</Text>
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

                        <Text style={styles.sectionTitle}>Date de publication</Text>
                        <Text style={styles.descriptionText}>{book.publication_date}</Text>

                        <Text style={styles.sectionTitle}>Genre</Text>
                        <Text style={styles.descriptionText}>{book.genre}</Text>

                        <Text style={styles.sectionTitle}>Lieu et époque</Text>
                        <Text style={styles.descriptionText}>{book.location_era}</Text>
                        
                        <Text style={styles.sectionTitle}>Quantité disponible</Text>
                        <View style={styles.quantityContainer}>
                            <Ionicons name="list-outline" size={20} color="#666" style={styles.quantityIcon} />
                            <Text style={styles.quantityText}>{book.quantity || 0}</Text>
                        </View>
                        
                        <View style={styles.actionsSection}>
                            {renderActionButton()}
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
    actionsSection: {
        marginTop: 10,
        gap: 12,
    },
    actionButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    disabledButton: {
        opacity: 0.7,
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
});

export default BookDetailsScreenUser;
