import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, Image, Alert, ActivityIndicator, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StatusBooksScreen = ({ navigation }) => {
    const [borrowRequests, setBorrowRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Charger les demandes d'emprunt de l'utilisateur
    const fetchBorrowRequests = async () => {
        try {
            setIsLoading(true);
            const userId = await AsyncStorage.getItem('userId');
            const token = await AsyncStorage.getItem('token');
            
            const response = await fetch(`http://192.168.1.4:5000/api/borrows/user/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des demandes');
            }
            
            const data = await response.json();
            setBorrowRequests(data);
            setIsLoading(false);
        } catch (error) {
            console.error("Erreur:", error);
            Alert.alert('Erreur', 'Impossible de charger vos demandes d\'emprunt');
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBorrowRequests();
        
        // Rafraîchir la liste lorsque l'écran est focalisé
        const unsubscribe = navigation.addListener('focus', () => {
            fetchBorrowRequests();
        });
        
        return unsubscribe;
    }, [navigation]);

    // Annuler une demande d'emprunt
    const handleCancelRequest = async (borrowId) => {
        try {
            setIsLoading(true);
            const userId = await AsyncStorage.getItem('userId');
            const token = await AsyncStorage.getItem('token');
            
            const response = await fetch(`http://192.168.1.4:5000/api/borrows/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    borrowId: borrowId,
                    userId: userId
                }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur lors de l\'annulation');
            }
            
            Alert.alert('Succès', 'Demande annulée avec succès');
            // Rafraîchir la liste après annulation
            fetchBorrowRequests();
        } catch (error) {
            console.error("Erreur:", error);
            Alert.alert('Erreur', error.message || 'Impossible d\'annuler la demande');
            setIsLoading(false);
        }
    };

    // Gérer le retour d'un livre
    const handleReturnBook = async (bookId) => {
        try {
            setIsLoading(true);
            const userId = await AsyncStorage.getItem('userId');
            const token = await AsyncStorage.getItem('token');
            
            const response = await fetch(`http://192.168.1.4:5000/api/borrows/return`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    bookId: bookId,
                    userId: userId
                }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur lors du retour');
            }
            
            Alert.alert('Succès', 'Livre marqué comme retourné avec succès');
            // Rafraîchir la liste après retour
            fetchBorrowRequests();
        } catch (error) {
            console.error("Erreur:", error);
            Alert.alert('Erreur', error.message || 'Impossible de retourner le livre');
            setIsLoading(false);
        }
    };

    // Rendre un élément de la liste des demandes
    const renderBorrowItem = ({ item }) => {
        // Définir la couleur de statut
        let statusColor;
        let statusText;
        let iconName;
        
        switch (item.status) {
            case 'pending':
                statusColor = '#F59E0B';
                statusText = 'En attente';
                iconName = 'hourglass-outline';
                break;
            case 'approved':
                statusColor = '#10B981';
                statusText = 'Approuvé - À récupérer';
                iconName = 'checkmark-circle-outline';
                break;
            case 'rejected':
                statusColor = '#EF4444';
                statusText = 'Rejeté';
                iconName = 'close-circle-outline';
                break;
            case 'borrowed':
                statusColor = '#3B82F6';
                statusText = 'En cours d\'emprunt';
                iconName = 'book-outline';
                break;
            case 'returned':
                statusColor = '#6B7280';
                statusText = 'Retourné';
                iconName = 'return-down-back-outline';
                break;
            default:
                statusColor = '#6B7280';
                statusText = 'Statut inconnu';
                iconName = 'help-circle-outline';
        }
        
        // Formater les dates
        const formatDate = (dateString) => {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', { 
                day: '2-digit', 
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        };

        return (
            <View style={styles.borrowCard}>
                <View style={styles.borrowHeader}>
                    <Text style={styles.bookTitle}>{item.title}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                        <Ionicons name={iconName} size={16} color="white" style={{ marginRight: 5 }} />
                        <Text style={styles.statusText}>{statusText}</Text>
                    </View>
                </View>
                
                <View style={styles.borrowContent}>
                    {item.imageUrl && (
                        <Image source={{ uri: item.imageUrl }} style={styles.coverThumbnail} />
                    )}
                    
                    <View style={styles.borrowInfo}>
                        <Text style={styles.authorName}>{item.author}</Text>
                        
                        <View style={styles.dateRow}>
                            <Ionicons name="calendar-outline" size={16} color="#666" />
                            <Text style={styles.dateText}>Demande: {formatDate(item.request_date)}</Text>
                        </View>
                        
                        {item.approval_date && (
                            <View style={styles.dateRow}>
                                <Ionicons name="checkmark-outline" size={16} color="#666" />
                                <Text style={styles.dateText}>Réponse: {formatDate(item.approval_date)}</Text>
                            </View>
                        )}
                        
                        {item.borrow_date && (
                            <View style={styles.dateRow}>
                                <Ionicons name="log-out-outline" size={16} color="#666" />
                                <Text style={styles.dateText}>Emprunt: {formatDate(item.borrow_date)}</Text>
                            </View>
                        )}
                        
                        {item.return_date && (
                            <View style={styles.dateRow}>
                                <Ionicons name="log-in-outline" size={16} color="#666" />
                                <Text style={styles.dateText}>Retour: {formatDate(item.return_date)}</Text>
                            </View>
                        )}
                        
                        {item.admin_notes && (
                            <View style={styles.notesContainer}>
                                <Text style={styles.notesLabel}>Notes:</Text>
                                <Text style={styles.notesText}>{item.admin_notes}</Text>
                            </View>
                        )}
                    </View>
                </View>
                
                <View style={styles.borrowActions}>
                    {item.status === 'pending' && (
                        <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={() => handleCancelRequest(item.id)}
                        >
                            <LinearGradient
                                colors={['#EF4444', '#DC2626']}
                                style={styles.actionGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Ionicons name="close-circle-outline" size={20} color="white" />
                                <Text style={styles.actionText}>Annuler la demande</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
                    
                    {item.status === 'borrowed' && (
                        <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={() => handleReturnBook(item.book_id)}
                        >
                            <LinearGradient
                                colors={['#3B82F6', '#2563EB']}
                                style={styles.actionGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Ionicons name="return-down-back-outline" size={20} color="white" />
                                <Text style={styles.actionText}>Marquer comme retourné</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}

{(item.status === 'approved' || item.status === 'borrowed') ? (
    <TouchableOpacity
        style={styles.viewButton}
        onPress={() => {
            console.log("URL du PDF:", item.pdfUrl); // Log pour vérifier l'URL
            if (item.pdfUrl) {
                navigation.navigate('PDFViewerScreen', {
                    pdfUrl: item.pdfUrl,
                    bookTitle: item.title,
                    bookId: item.book_id
                });
            } else {
                // Si l'URL du PDF n'est pas disponible, nous construisons l'URL avec l'endpoint correct
                const pdfUrl = `http://192.168.1.4:5000/api/books/${item.book_id}/download-pdf`;
                console.log("URL construite:", pdfUrl);
                navigation.navigate('PDFViewerScreen', {
                    pdfUrl: pdfUrl,
                    bookTitle: item.title,
                    bookId: item.book_id
                });
            }
        }}
    >
        <LinearGradient
            colors={['#4F6CE1', '#7D55F3']}
            style={styles.viewButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
        >
            <Ionicons name="document-text-outline" size={20} color="white" />
            <Text style={styles.viewButtonText}>Voir le livre</Text>
        </LinearGradient>
    </TouchableOpacity>
) : (
    <View style={styles.viewButtonDisabled}>
        <Ionicons name="document-text-outline" size={20} color="#A0AEC0" />
        <Text style={styles.viewButtonTextDisabled}>Voir le livre</Text>
    </View>
)}
                </View>
            </View>
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
                <Text style={styles.headerTitle}>Mes demandes d'emprunt</Text>
            </LinearGradient>
            
            {borrowRequests.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="book-outline" size={60} color="#CBD5E0" />
                    <Text style={styles.emptyText}>Aucune demande d'emprunt</Text>
                    <Text style={styles.emptySubText}>
                        Parcourez notre catalogue et empruntez des livres pour les voir apparaître ici.
                    </Text>
                    <TouchableOpacity 
                        style={styles.browseButton}
                        onPress={() => navigation.navigate('HomeScreen')}
                    >
                        <LinearGradient
                            colors={['#4F6CE1', '#7D55F3']}
                            style={styles.browseButtonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Ionicons name="library-outline" size={22} color="white" />
                            <Text style={styles.browseButtonText}>Explorer la bibliothèque</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={borrowRequests}
                    renderItem={renderBorrowItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    refreshing={isLoading}
                    onRefresh={fetchBorrowRequests}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#4B5563',
    },
    headerGradient: {
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 15,
    },
    listContainer: {
        padding: 16,
    },
    borrowCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    borrowHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    bookTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        flex: 1,
    },
    statusBadge: {
        flexDirection: 'row',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignItems: 'center',
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    borrowContent: {
        flexDirection: 'row',
    },
    coverThumbnail: {
        width: 70,
        height: 100,
        borderRadius: 6,
        marginRight: 12,
    },
    borrowInfo: {
        flex: 1,
    },
    authorName: {
        fontSize: 14,
        color: '#4B5563',
        marginBottom: 8,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    dateText: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 6,
    },
    notesContainer: {
        marginTop: 8,
        backgroundColor: '#F9FAFB',
        padding: 8,
        borderRadius: 6,
    },
    notesLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#4B5563',
        marginBottom: 4,
    },
    notesText: {
        fontSize: 12,
        color: '#6B7280',
        fontStyle: 'italic',
    },
    borrowActions: {
        marginTop: 16,
        flexDirection: 'column',
    },
    actionButton: {
        marginBottom: 8,
        borderRadius: 8,
        overflow: 'hidden',
    },
    actionGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
    },
    actionText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    viewButton: {
        borderRadius: 8,
        overflow: 'hidden',
    },
    viewButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
    },
    viewButtonText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4B5563',
        marginTop: 16,
    },
    emptySubText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 24,
    },
    browseButton: {
        borderRadius: 8,
        overflow: 'hidden',
        width: '80%',
    },
    browseButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
    },
    browseButtonText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    // Ajoutez ces styles à votre objet styles
viewButtonDisabled: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 10,
    opacity: 0.5,
},
viewButtonTextDisabled: {
    color: '#A0AEC0',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
},
});

export default StatusBooksScreen;