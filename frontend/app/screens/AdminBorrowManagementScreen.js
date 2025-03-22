import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    FlatList, 
    TouchableOpacity, 
    ActivityIndicator, 
    Alert, 
    StatusBar,
    StyleSheet,
    Image,
    TextInput,
    Modal,ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AdminBorrowManagementScreen = ({ navigation }) => {
    const [borrowRequests, setBorrowRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, approved, borrowed, returned
    const [searchQuery, setSearchQuery] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedBorrow, setSelectedBorrow] = useState(null);
    const [adminNotes, setAdminNotes] = useState('');

    // Charger toutes les demandes d'emprunt
    const fetchBorrowRequests = async () => {
        try {
            setIsLoading(true);
            const token = await AsyncStorage.getItem('token');
            
            const response = await fetch(`http://192.168.1.4:5000/api/borrows/admin/all`, {
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
            Alert.alert('Erreur', 'Impossible de charger les demandes d\'emprunt');
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

    // Filtrer les demandes selon le statut et la recherche
    const getFilteredRequests = () => {
        let filtered = borrowRequests;
        
        // Filtrer par statut
        if (filter !== 'all') {
            filtered = filtered.filter(item => item.status === filter);
        }
        
        // Filtrer par recherche
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(item => 
                item.title.toLowerCase().includes(query) || 
                item.author.toLowerCase().includes(query) || 
                item.username.toLowerCase().includes(query) ||
                item.email.toLowerCase().includes(query)
            );
        }
        
        return filtered;
    };

    // Actions d'administration
    const handleApproveRequest = async () => {
        if (!selectedBorrow) return;
        
        try {
            setIsLoading(true);
            const token = await AsyncStorage.getItem('token');
            
            const response = await fetch(`http://192.168.1.4:5000/api/borrows/admin/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    borrowId: selectedBorrow.id,
                    notes: adminNotes
                }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur lors de l\'approbation');
            }
            
            Alert.alert('Succès', 'Demande approuvée avec succès');
            setModalVisible(false);
            setAdminNotes('');
            fetchBorrowRequests();
        } catch (error) {
            console.error("Erreur:", error);
            Alert.alert('Erreur', error.message || 'Impossible d\'approuver la demande');
            setIsLoading(false);
        }
    };

    const handleRejectRequest = async () => {
        if (!selectedBorrow) return;
        
        try {
            setIsLoading(true);
            const token = await AsyncStorage.getItem('token');
            
            const response = await fetch(`http://192.168.1.4:5000/api/borrows/admin/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    borrowId: selectedBorrow.id,
                    notes: adminNotes
                }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur lors du rejet');
            }
            
            Alert.alert('Succès', 'Demande rejetée avec succès');
            setModalVisible(false);
            setAdminNotes('');
            fetchBorrowRequests();
        } catch (error) {
            console.error("Erreur:", error);
            Alert.alert('Erreur', error.message || 'Impossible de rejeter la demande');
            setIsLoading(false);
        }
    };

    const handleConfirmBorrow = async () => {
        if (!selectedBorrow) return;
        
        try {
            setIsLoading(true);
            const token = await AsyncStorage.getItem('token');
            
            const response = await fetch(`http://192.168.1.4:5000/api/borrows/admin/confirm-borrow`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    borrowId: selectedBorrow.id,
                    notes: adminNotes
                }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur lors de la confirmation');
            }
            
            Alert.alert('Succès', 'Emprunt confirmé avec succès');
            setModalVisible(false);
            setAdminNotes('');
            fetchBorrowRequests();
        } catch (error) {
            console.error("Erreur:", error);
            Alert.alert('Erreur', error.message || 'Impossible de confirmer l\'emprunt');
            setIsLoading(false);
        }
    };

    const handleConfirmReturn = async () => {
        if (!selectedBorrow) return;
        
        try {
            setIsLoading(true);
            const token = await AsyncStorage.getItem('token');
            
            const response = await fetch(`http://192.168.1.4:5000/api/borrows/admin/confirm-return`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    borrowId: selectedBorrow.id,
                    notes: adminNotes
                }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur lors de la confirmation du retour');
            }
            
            Alert.alert('Succès', 'Retour confirmé avec succès');
            setModalVisible(false);
            setAdminNotes('');
            fetchBorrowRequests();
        } catch (error) {
            console.error("Erreur:", error);
            Alert.alert('Erreur', error.message || 'Impossible de confirmer le retour');
            setIsLoading(false);
        }
    };

    // Afficher le modal avec les actions appropriées selon le statut
    const openActionModal = (borrow) => {
        setSelectedBorrow(borrow);
        setAdminNotes('');
        setModalVisible(true);
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
                statusText = 'Approuvé';
                iconName = 'checkmark-circle-outline';
                break;
            case 'rejected':
                statusColor = '#EF4444';
                statusText = 'Rejeté';
                iconName = 'close-circle-outline';
                break;
            case 'borrowed':
                statusColor = '#3B82F6';
                statusText = 'Emprunté';
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
                        
                        <View style={styles.userInfoBox}>
                            <Ionicons name="person-outline" size={16} color="#4B5563" />
                            <Text style={styles.userInfoText}>{item.name}</Text>
                        </View>
                        
                        <View style={styles.userInfoBox}>
                            <Ionicons name="mail-outline" size={16} color="#4B5563" />
                            <Text style={styles.userInfoText}>{item.email}</Text>
                        </View>
                        
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
                
                <TouchableOpacity
                    style={styles.manageButton}
                    onPress={() => openActionModal(item)}
                >
                    <LinearGradient
                        colors={['#4F6CE1', '#7D55F3']}
                        style={styles.manageButtonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Ionicons name="settings-outline" size={20} color="white" />
                        <Text style={styles.manageButtonText}>Gérer cette demande</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        );
    };

    // Filtres pour le statut
    const renderFilterButtons = () => {
        const filters = [
            { id: 'all', label: 'Tous', icon: 'list-outline' },
            { id: 'pending', label: 'En attente', icon: 'hourglass-outline' },
            { id: 'approved', label: 'Approuvés', icon: 'checkmark-circle-outline' },
            { id: 'borrowed', label: 'Empruntés', icon: 'book-outline' },
            { id: 'returned', label: 'Retournés', icon: 'return-down-back-outline' }
        ];
        
        return (
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterContainer}
                contentContainerStyle={styles.filterContent}
            >
                {filters.map(item => (
                    <TouchableOpacity
                        key={item.id}
                        style={[
                            styles.filterButton,
                            filter === item.id && styles.filterButtonActive
                        ]}
                        onPress={() => setFilter(item.id)}
                    >
                        <Ionicons
                            name={item.icon}
                            size={16}
                            color={filter === item.id ? 'white' : '#4B5563'}
                        />
                        <Text
                            style={[
                                styles.filterButtonText,
                                filter === item.id && styles.filterButtonTextActive
                            ]}
                        >
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
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
                <Text style={styles.headerTitle}>Gestion des emprunts</Text>
            </LinearGradient>
            
            {/* Barre de recherche */}
            <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={20} color="#6B7280" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Rechercher par titre, auteur ou utilisateur..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#9CA3AF"
                />
                {searchQuery.trim() !== '' && (
                    <TouchableOpacity 
                        style={styles.clearButton}
                        onPress={() => setSearchQuery('')}
                    >
                        <Ionicons name="close-circle" size={20} color="#6B7280" />
                    </TouchableOpacity>
                )}
            </View>
            
            {/* Filtres */}
            {renderFilterButtons()}
            
            {getFilteredRequests().length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="library-outline" size={60} color="#CBD5E0" />
                    <Text style={styles.emptyText}>Aucune demande trouvée</Text>
                    <Text style={styles.emptySubText}>
                        Aucune demande ne correspond à votre recherche ou au filtre sélectionné.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={getFilteredRequests()}
                    renderItem={renderBorrowItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    refreshing={isLoading}
                    onRefresh={fetchBorrowRequests}
                />
            )}
            
            {/* Modal d'action */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Gérer la demande
                            </Text>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Ionicons name="close" size={24} color="#4B5563" />
                            </TouchableOpacity>
                        </View>
                        
                        {selectedBorrow && (
                            <View style={styles.modalContent}>
                                <Text style={styles.modalBookTitle}>{selectedBorrow.title}</Text>
                                <Text style={styles.modalUserInfo}>
                                    Demandé par: {selectedBorrow.username} ({selectedBorrow.email})
                                </Text>
                                
                                <Text style={styles.notesLabel}>Notes administratives:</Text>
                                <TextInput
                                    style={styles.notesInput}
                                    placeholder="Ajouter des notes (optionnel)..."
                                    value={adminNotes}
                                    onChangeText={setAdminNotes}
                                    multiline={true}
                                    numberOfLines={4}
                                    placeholderTextColor="#9CA3AF"
                                />
                                
                                <View style={styles.modalActions}>
                                    {selectedBorrow.status === 'pending' && (
                                        <>
                                            <TouchableOpacity
                                                style={[styles.actionButton, styles.approveButton]}
                                                onPress={handleApproveRequest}
                                            >
                                                <Ionicons name="checkmark-circle" size={20} color="white" />
                                                <Text style={styles.actionButtonText}>Approuver</Text>
                                            </TouchableOpacity>
                                            
                                            <TouchableOpacity
                                                style={[styles.actionButton, styles.rejectButton]}
                                                onPress={handleRejectRequest}
                                            >
                                                <Ionicons name="close-circle" size={20} color="white" />
                                                <Text style={styles.actionButtonText}>Rejeter</Text>
                                            </TouchableOpacity>
                                        </>
                                    )}
                                    
                                    {selectedBorrow.status === 'approved' && (
                                        <TouchableOpacity
                                            style={[styles.actionButton, styles.confirmButton]}
                                            onPress={handleConfirmBorrow}
                                        >
                                            <Ionicons name="book" size={20} color="white" />
                                            <Text style={styles.actionButtonText}>Confirmer l'emprunt</Text>
                                        </TouchableOpacity>
                                    )}
                                    
                                    {selectedBorrow.status === 'borrowed' && (
                                        <TouchableOpacity
                                            style={[styles.actionButton, styles.returnButton]}
                                            onPress={handleConfirmReturn}
                                        >
                                            <Ionicons name="return-down-back" size={20} color="white" />
                                            <Text style={styles.actionButtonText}>Confirmer le retour</Text>
                                        </TouchableOpacity>
                                    )}
                                    
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.cancelButton]}
                                        onPress={() => setModalVisible(false)}
                                    >
                                        <Ionicons name="close" size={20} color="white" />
                                        <Text style={styles.actionButtonText}>Annuler</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#1F2937',
    },
    clearButton: {
        padding: 4,
    },
    filterContainer: {
        paddingHorizontal: 8,
        marginBottom: 8,
    },
    filterContent: {
        paddingVertical: 8,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
    },
    filterButtonActive: {
        backgroundColor: '#4F6CE1',
    },
    filterButtonText: {
        fontSize: 12,
        color: '#4B5563',
        marginLeft: 4,
    },
    filterButtonTextActive: {
        color: 'white',
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
        borderRadius: 16,
        alignItems: 'center',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: 'white',
    },
    borrowContent: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    coverThumbnail: {
        width: 80,
        height: 120,
        borderRadius: 8,
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
    userInfoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    userInfoText: {
        marginLeft: 6,
        fontSize: 13,
        color: '#4B5563',
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    dateText: {
        marginLeft: 6,
        fontSize: 12,
        color: '#6B7280',
    },
    notesContainer: {
        marginTop: 6,
        padding: 8,
        backgroundColor: '#F9FAFB',
        borderRadius: 6,
    },
    notesLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4B5563',
        marginBottom: 4,
    },
    notesText: {
        fontSize: 12,
        color: '#6B7280',
    },
    manageButton: {
        marginTop: 8,
    },
    manageButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
    },
    manageButtonText: {
        color: 'white',
        marginLeft: 8,
        fontWeight: '600',
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
        marginTop: 20,
    },
    emptySubText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 10,
    },
    // Modal styles
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    closeButton: {
        padding: 4,
    },
    modalContent: {
        padding: 16,
    },
    modalBookTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    modalUserInfo: {
        fontSize: 14,
        color: '#4B5563',
        marginBottom: 16,
    },
    notesInput: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        color: '#1F2937',
        backgroundColor: '#F9FAFB',
        textAlignVertical: 'top',
    },
    modalActions: {
        flexDirection: 'column',
        gap: 8,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    approveButton: {
        backgroundColor: '#10B981',
    },
    rejectButton: {
        backgroundColor: '#EF4444',
    },
    confirmButton: {
        backgroundColor: '#3B82F6',
    },
    returnButton: {
        backgroundColor: '#6366F1',
    },
    cancelButton: {
        backgroundColor: '#6B7280',
    },
    actionButtonText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 8,
    }
});


export default AdminBorrowManagementScreen;