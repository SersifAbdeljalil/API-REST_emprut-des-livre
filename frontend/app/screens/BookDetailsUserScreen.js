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

    // Vérifier si bookId est défini avant de charger les détails
    useEffect(() => {
        // Si bookId n'est pas défini, afficher un message d'erreur et retourner
        if (!bookId) {
            setIsLoading(false);
            return;
        }

        const fetchBookDetails = async () => {
            try {
                setIsLoading(true);
                // Récupération des détails du livre
                const response = await fetch(`http://192.168.1.4:5000/api/books/${bookId}`, {
                    headers: {
                        Authorization: `Bearer ${await AsyncStorage.getItem('token')}`,
                    },
                });
                const data = await response.json();

                const updatedBook = {
                    ...data,
                    imageUrl: `http://192.168.1.4:5000/${data.image_url.replace("\\", "/")}`,
                    pdfUrl: data.pdf_url ? `http://192.168.1.4:5000/${data.pdf_url.replace("\\", "/")}` : null,
                };
                setBook(updatedBook);

                // Récupération du statut d'emprunt pour ce livre par l'utilisateur courant
                const userId = await AsyncStorage.getItem('userId');
                const borrowResponse = await fetch(`http://192.168.1.4:5000/api/borrows/status?bookId=${bookId}&userId=${userId}`, {
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

    // Gérer la demande d'emprunt
    const handleBorrowRequest = async () => {
        if (!bookId) {
            Alert.alert('Erreur', 'Identifiant du livre manquant');
            return;
        }
    
        try {
            setIsLoading(true);
            const userId = await AsyncStorage.getItem('userId');
            
            // Vérifiez que userId est bien défini
            if (!userId) {
                Alert.alert('Erreur', 'Utilisateur non identifié');
                setIsLoading(false);
                return;
            }
    
            console.log("User ID from AsyncStorage:", userId); // Log pour vérifier la valeur de userId
    
            if (borrowStatus === 'borrowed') {
                // Retourner un livre
                const response = await fetch(`http://192.168.1.4:5000/api/borrows/return`, {
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
                } else {
                    const errorData = await response.json();
                    Alert.alert('Erreur', errorData.message || 'Impossible de retourner le livre');
                }
            } else {
                // Emprunter un livre
                const response = await fetch(`http://192.168.1.4:5000/api/borrows/request`, {
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

    // Rendu conditionnel du bouton d'action selon le statut d'emprunt
    const renderActionButton = () => {
        let buttonText = '';
        let buttonColors = ['#4F6CE1', '#7D55F3'];
        let isDisabled = false;

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
                buttonText = 'Emprunter ce livre';
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
                        name={borrowStatus === 'borrowed' ? "return-down-back-outline" : "book-outline"} 
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
        backgroundColor: '#f5f6fa',
    },
    headerGradient: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 20,
    },
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        overflow: 'hidden',
    },
    imageSection: {
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: '#f8fafc',
    },
    coverImage: {
        width: 140,
        height: 220,
        borderRadius: 8,
        resizeMode: 'cover',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    infoSection: {
        padding: 20,
    },
    bookTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a202c',
        marginBottom: 8,
        textAlign: 'center',
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    authorIcon: {
        marginRight: 6,
    },
    authorName: {
        fontSize: 16,
        color: '#666',
    },
    divider: {
        height: 1,
        backgroundColor: '#e2e8f0',
        marginVertical: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2d3748',
        marginBottom: 8,
    },
    descriptionText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#4a5568',
        marginBottom: 16,
    },
    actionsSection: {
        marginTop: 20,
    },
    actionButton: {
        marginBottom: 12,
        borderRadius: 8,
        overflow: 'hidden',
    },
    disabledButton: {
        opacity: 0.7,
    },
    actionGradient: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f6fa',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#4F6CE1',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f6fa',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#4a5568',
        textAlign: 'center',
        marginVertical: 20,
    },
    errorButton: {
        borderRadius: 8,
        overflow: 'hidden',
        marginTop: 20,
    },
    errorButtonGradient: {
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    errorButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default BookDetailsScreenUser;