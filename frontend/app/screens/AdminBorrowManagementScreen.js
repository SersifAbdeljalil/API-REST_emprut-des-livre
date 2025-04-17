import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    FlatList, 
    TouchableOpacity, 
    ActivityIndicator, 
    StatusBar,
    StyleSheet,
    Image,
    TextInput,
    Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView } from 'react-native';
import CustomAlert from './CustomAlert'; // Assurez-vous que le chemin est correct

const AdminBorrowManagementScreen = ({ navigation }) => {
    const [borrowRequests, setBorrowRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, approved, borrowed, returned
    const [searchQuery, setSearchQuery] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedBorrow, setSelectedBorrow] = useState(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [bookQuantities, setBookQuantities] = useState({}); // Stocke la quantité de chaque livre

    // État pour CustomAlert
    const [alert, setAlert] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'success',
        buttons: []
    });

    // Charger toutes les demandes d'emprunt
    const fetchBorrowRequests = async () => {
        try {
            setIsLoading(true);
            const token = await AsyncStorage.getItem('token');
            
            const response = await fetch(`http://192.168.11.119:5000/api/borrows/admin/all`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des demandes');
            }
            
            const data = await response.json();
            setBorrowRequests(data);
            
            // Récupérer la quantité de chaque livre référencé
            const uniqueBookIds = [...new Set(data.map(item => item.book_id))];
            const quantities = {};
            
            for (const bookId of uniqueBookIds) {
                const bookResponse = await fetch(`http://192.168.11.119:5000/api/books/${bookId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                
                if (bookResponse.ok) {
                    const bookData = await bookResponse.json();
                    quantities[bookId] = bookData.quantity || 0;
                }
            }
            
            setBookQuantities(quantities);
            setIsLoading(false);
        } catch (error) {
            console.error("Erreur:", error);
            setAlert({
                visible: true,
                title: 'Erreur',
                message: 'Impossible de charger les demandes d\'emprunt',
                type: 'error',
                buttons: [{ text: 'OK', onPress: () => {} }]
            });
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
            
            const response = await fetch(`http://192.168.11.119:5000/api/borrows/admin/approve`, {
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
            
            setAlert({
                visible: true,
                title: 'Succès',
                message: 'Demande approuvée avec succès',
                type: 'success',
                buttons: [{ text: 'OK', onPress: () => {} }]
            });
            setModalVisible(false);
            setAdminNotes('');
            fetchBorrowRequests();
        } catch (error) {
            console.error("Erreur:", error);
            setAlert({
                visible: true,
                title: 'Erreur',
                message: error.message || 'Impossible d\'approuver la demande',
                type: 'error',
                buttons: [{ text: 'OK', onPress: () => {} }]
            });
            setIsLoading(false);
        }
    };

    const handleRejectRequest = async () => {
        if (!selectedBorrow) return;
        
        try {
            setIsLoading(true);
            const token = await AsyncStorage.getItem('token');
            
            const response = await fetch(`http://192.168.11.119:5000/api/borrows/admin/reject`, {
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
            
            setAlert({
                visible: true,
                title: 'Succès',
                message: 'Demande rejetée avec succès',
                type: 'success',
                buttons: [{ text: 'OK', onPress: () => {} }]
            });
            setModalVisible(false);
            setAdminNotes('');
            fetchBorrowRequests();
        } catch (error) {
            console.error("Erreur:", error);
            setAlert({
                visible: true,
                title: 'Erreur',
                message: error.message || 'Impossible de rejeter la demande',
                type: 'error',
                buttons: [{ text: 'OK', onPress: () => {} }]
            });
            setIsLoading(false);
        }
    };

    const handleConfirmBorrow = async () => {
        if (!selectedBorrow) return;
        
        // Vérifier la quantité disponible du livre
        if (bookQuantities[selectedBorrow.book_id] <= 0) {
            setAlert({
                visible: true,
                title: 'Erreur',
                message: 'Ce livre n\'est plus disponible en stock',
                type: 'error',
                buttons: [{ text: 'OK', onPress: () => setModalVisible(false) }]
            });
            return;
        }
        
        try {
            setIsLoading(true);
            const token = await AsyncStorage.getItem('token');
            
            const response = await fetch(`http://192.168.11.119:5000/api/borrows/admin/confirm-borrow`, {
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
            
            // Mettre à jour la quantité locale du livre
            setBookQuantities(prev => ({
                ...prev,
                [selectedBorrow.book_id]: Math.max(0, prev[selectedBorrow.book_id] - 1)
            }));
            
            setAlert({
                visible: true,
                title: 'Succès',
                message: 'Emprunt confirmé avec succès',
                type: 'success',
                buttons: [{ text: 'OK', onPress: () => {} }]
            });
            setModalVisible(false);
            setAdminNotes('');
            fetchBorrowRequests();
        } catch (error) {
            console.error("Erreur:", error);
            setAlert({
                visible: true,
                title: 'Erreur',
                message: error.message || 'Impossible de confirmer l\'emprunt',
                type: 'error',
                buttons: [{ text: 'OK', onPress: () => {} }]
            });
            setIsLoading(false);
        }
    };

    const handleConfirmReturn = async () => {
        if (!selectedBorrow) return;
        
        try {
            setIsLoading(true);
            const token = await AsyncStorage.getItem('token');
            
            const response = await fetch(`http://192.168.11.119:5000/api/borrows/admin/confirm-return`, {
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
            
            // Ajouter ces lignes pour déboguer
            const responseText = await response.text();
            console.log("Réponse brute:", responseText);
            
            // Essayer de parser manuellement pour éviter l'erreur
            let errorData;
            try {
                errorData = JSON.parse(responseText);
            } catch (parseError) {
                console.error("Erreur de parsing:", parseError);
                throw new Error("Le serveur a renvoyé une réponse non-JSON");
            }
            
            if (!response.ok) {
                throw new Error(errorData.message || 'Erreur lors de la confirmation du retour');
            }
            
            // Mettre à jour la quantité locale du livre
            setBookQuantities(prev => ({
                ...prev,
                [selectedBorrow.book_id]: (prev[selectedBorrow.book_id] || 0) + 1
            }));
            
            setAlert({
                visible: true,
                title: 'Succès',
                message: 'Retour confirmé avec succès',
                type: 'success',
                buttons: [{ text: 'OK', onPress: () => {} }]
            });
            setModalVisible(false);
            setAdminNotes('');
            fetchBorrowRequests();
        } catch (error) {
            console.error("Erreur:", error);
            setAlert({
                visible: true,
                title: 'Erreur',
                message: error.message || 'Impossible de confirmer le retour',
                type: 'error',
                buttons: [{ text: 'OK', onPress: () => {} }]
            });
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

        // Obtenir la quantité disponible du livre
        const bookQuantity = bookQuantities[item.book_id] || 0;

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
                            <Text style={styles.userInfoText}>{item.username}</Text>
                        </View>
                        
                        <View style={styles.userInfoBox}>
                            <Ionicons name="mail-outline" size={16} color="#4B5563" />
                            <Text style={styles.userInfoText}>{item.email}</Text>
                        </View>
                        
                        <View style={styles.stockInfo}>
                            <Ionicons name="list-outline" size={16} color={bookQuantity > 0 ? "#38A169" : "#E53E3E"} />
                            <Text style={[styles.stockText, { color: bookQuantity > 0 ? "#38A169" : "#E53E3E" }]}>
                                {bookQuantity > 0 ? `En stock (${bookQuantity})` : "Épuisé"}
                            </Text>
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
                contentContainerStyle={styles.filterContent}
                style={styles.filterScrollView}
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
                                
                                {/* Afficher la quantité disponible */}
                                <View style={styles.modalQuantityContainer}>
                                    <Ionicons 
                                        name="list-outline" 
                                        size={18} 
                                        color={bookQuantities[selectedBorrow.book_id] > 0 ? "#38A169" : "#E53E3E"} 
                                    />
                                    <Text style={[
                                        styles.modalQuantityText, 
                                        { color: bookQuantities[selectedBorrow.book_id] > 0 ? "#38A169" : "#E53E3E" }
                                    ]}>
                                        Quantité disponible: {bookQuantities[selectedBorrow.book_id] || 0}
                                    </Text>
                                </View>
                                
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
                                            style={[
                                                styles.actionButton, 
                                                styles.confirmButton,
                                                bookQuantities[selectedBorrow.book_id] <= 0 && styles.disabledButton
                                            ]}
                                            onPress={handleConfirmBorrow}
                                            disabled={bookQuantities[selectedBorrow.book_id] <= 0}
                                        >
                                            <Ionicons name="book" size={20} color="white" />
                                            <Text style={styles.actionButtonText}>
                                                {bookQuantities[selectedBorrow.book_id] <= 0 
                                                    ? 'Stock épuisé' 
                                                    : 'Confirmer l\'emprunt'}
                                            </Text>
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
    searchContainer: {
        backgroundColor: 'white',
        margin: 15,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#4B5563',
    },
    clearButton: {
        padding: 5,
    },
    filterContainer: {
        marginBottom: 10,
    },
    filterContent: {
        paddingHorizontal: 15,
        paddingVertical: 5,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    filterButtonActive: {
        backgroundColor: '#4F6CE1',
    },
    filterButtonText: {
        fontSize: 14,
        color: '#4B5563',
        marginLeft: 5,
    },
    filterButtonTextActive: {
        color: 'white',
    },
    listContainer: {
        padding: 15,
    },
    borrowCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 3,
        marginBottom: 15,
        overflow: 'hidden',
    },
    borrowHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F7FAFC',
        padding: 15,
    },
    bookTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2D3748',
        flex: 1,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 15,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginLeft: 10,
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    borrowContent: {
        flexDirection: 'row',
        padding: 15,
    },
    coverThumbnail: {
        width: 80,
        height: 120,
        borderRadius: 5,
        backgroundColor: '#E2E8F0',
    },
    borrowInfo: {
        flex: 1,
        marginLeft: 15,
    },
    authorName: {
        fontSize: 14,
        color: '#4A5568',
        fontWeight: '500',
        marginBottom: 8,
    },
    userInfoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    userInfoText: {
        fontSize: 14,
        color: '#4B5563',
        marginLeft: 8,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    dateText: {
        fontSize: 13,
        color: '#718096',
        marginLeft: 8,
    },
    notesContainer: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#F7FAFC',
        borderRadius: 8,
    },
    notesLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4A5568',
        marginBottom: 5,
    },
    notesText: {
        fontSize: 13,
        color: '#718096',
        fontStyle: 'italic',
    },
    manageButton: {
        borderRadius: 0,
        overflow: 'hidden',
    },
    manageButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
    },
    manageButtonText: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600',
        marginLeft: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#4A5568',
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
        color: '#4A5568',
        marginTop: 20,
    },
    emptySubText: {
        fontSize: 14,
        color: '#718096',
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        backgroundColor: 'white',
        borderRadius: 15,
        width: '90%',
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F7FAFC',
        paddingHorizontal:
        20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2D3748',
    },
    closeButton: {
        padding: 5,
    },
    modalContent: {
        padding: 20,
    },
    modalBookTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2D3748',
        marginBottom: 5,
    },
    modalUserInfo: {
        fontSize: 14,
        color: '#4A5568',
        marginBottom: 15,
    },
    modalQuantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7FAFC',
        padding: 10,
        borderRadius: 8,
        marginBottom: 15,
    },
    modalQuantityText: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 10,
    },
    notesInput: {
        backgroundColor: '#F7FAFC',
        borderRadius: 8,
        padding: 12,
        height: 100,
        textAlignVertical: 'top',
        color: '#4A5568',
        fontSize: 14,
        marginBottom: 20,
    },
    modalActions: {
        gap: 10,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
    },
    actionButtonText: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600',
        marginLeft: 8,
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
        backgroundColor: '#DD6B20',
    },
    cancelButton: {
        backgroundColor: '#6B7280',
    },
    disabledButton: {
        opacity: 0.6,
    },
    stockInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    stockText: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    filterContainer: {
        marginBottom: 10,
        paddingHorizontal: 15,
    },
    filterContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    filterScrollView: {
        flexGrow: 0, // Empêche le ScrollView de prendre tout l'espace
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
        minWidth: 100, // Largeur minimale
    },
    filterButtonText: {
        fontSize: 14,
        marginLeft: 5,
        color: '#4B5563',
    },
    filterButtonActive: {
        backgroundColor: '#4F6CE1',
    },
    filterButtonTextActive: {
        color: 'white',
    }
});

export default AdminBorrowManagementScreen;