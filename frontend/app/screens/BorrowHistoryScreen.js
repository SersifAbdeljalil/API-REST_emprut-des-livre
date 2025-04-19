import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from './CustomAlert';

const BorrowHistoryScreen = ({ navigation }) => {
  const [borrowHistory, setBorrowHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  
  // État pour CustomAlert
  const [alert, setAlert] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'success',
    buttons: []
  });

  // Récupérer l'ID de l'utilisateur
  const getUserId = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        navigation.replace('Login');
        return null;
      }
      
      const response = await fetch('http://192.168.1.172:5000/api/auth/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserId(data.id);
        return data.id;
      } else {
        showAlert('Erreur', 'Erreur lors de la récupération du profil', 'error');
        return null;
      }
    } catch (error) {
      console.error('Erreur:', error);
      showAlert('Erreur', 'Problème lors de la récupération du profil', 'error');
      return null;
    }
  };

  // Récupérer l'historique des emprunts
  const fetchBorrowHistory = async (id) => {
    try {
      if (!id) return;
      
      const token = await AsyncStorage.getItem('token');
      
      const response = await fetch(`http://192.168.1.172:5000/api/borrows/user/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Données reçues:", data);
        
        // Traiter les données pour corriger les URL d'images
        const processedData = data.map(item => {
          // Si image_url est présent, formater l'URL correctement
          if (item.image_url) {
            return {
              ...item,
              imageUrl: `http://192.168.1.172:5000/${item.image_url.replace(/\\/g, "/")}`
            };
          } 
          // Si imageUrl est présent mais pas image_url
          else if (item.imageUrl) {
            // Si c'est une URL relative, la convertir en absolue
            if (!item.imageUrl.startsWith('http')) {
              return {
                ...item,
                imageUrl: `http://192.168.1.172:5000/${item.imageUrl.replace(/\\/g, "/")}`
              };
            }
            return item;
          } 
          // Si aucune image n'est disponible
          else {
            return {
              ...item,
              imageUrl: 'https://via.placeholder.com/150/4F6CE1/FFFFFF?text=Livre'
            };
          }
        });
        
        console.log("Données traitées:", processedData);
        setBorrowHistory(processedData);
      } else {
        showAlert('Erreur', 'Erreur lors de la récupération de l\'historique', 'error');
      }
    } catch (error) {
      console.error('Erreur:', error);
      showAlert('Erreur', 'Problème lors de la récupération de l\'historique', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Initialisation
  useEffect(() => {
    const initScreen = async () => {
      setLoading(true);
      const id = await getUserId();
      if (id) {
        await fetchBorrowHistory(id);
      }
    };
    
    initScreen();
  }, []);

  // Afficher une alerte
  const showAlert = (title, message, type) => {
    setAlert({
      visible: true,
      title,
      message,
      type,
      buttons: [{ text: 'OK', onPress: () => {} }]
    });
  };

  // Annuler une demande d'emprunt
  const handleCancelRequest = async (borrowId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      const response = await fetch('http://192.168.1.172:5000/api/borrows/cancel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          borrowId,
          userId
        })
      });
      
      if (response.ok) {
        // Mettre à jour la liste après annulation
        showAlert('Succès', 'Demande annulée avec succès', 'success');
        fetchBorrowHistory(userId);
      } else {
        const errorData = await response.json();
        showAlert('Erreur', errorData.message || 'Erreur lors de l\'annulation', 'error');
      }
    } catch (error) {
      console.error('Erreur:', error);
      showAlert('Erreur', 'Problème lors de l\'annulation de la demande', 'error');
    }
  };

  // Retourner un livre
  const handleReturnBook = async (bookId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      const response = await fetch('http://192.168.1.172:5000/api/borrows/return', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookId,
          userId
        })
      });
      
      if (response.ok) {
        // Mettre à jour la liste après retour
        showAlert('Succès', 'Retour du livre enregistré avec succès', 'success');
        fetchBorrowHistory(userId);
      } else {
        const errorData = await response.json();
        showAlert('Erreur', errorData.message || 'Erreur lors du retour', 'error');
      }
    } catch (error) {
      console.error('Erreur:', error);
      showAlert('Erreur', 'Problème lors du retour du livre', 'error');
    }
  };

  // Afficher le statut de l'emprunt
  const renderStatus = (status) => {
    switch (status) {
      case 'pending':
        return <Text style={[styles.statusText, { color: '#ED8936' }]}>En attente</Text>;
      case 'approved':
        return <Text style={[styles.statusText, { color: '#4299E1' }]}>Approuvé</Text>;
      case 'rejected':
        return <Text style={[styles.statusText, { color: '#E53E3E' }]}>Rejeté</Text>;
      case 'borrowed':
        return <Text style={[styles.statusText, { color: '#38A169' }]}>Emprunté</Text>;
      case 'returned':
        return <Text style={[styles.statusText, { color: '#718096' }]}>Retourné</Text>;
      default:
        return <Text style={styles.statusText}>{status}</Text>;
    }
  };

  // Convertir une date en format lisible
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Rendu d'un élément de la liste
  const renderBorrowItem = ({ item }) => {
    console.log("Rendu item:", item.title, "URL image:", item.imageUrl);
    // Image par défaut
    const defaultImage = 'https://via.placeholder.com/150/4F6CE1/FFFFFF?text=Livre';
    
    return (
      <View style={styles.borrowItem}>
        <View style={styles.bookInfo}>
          <Image 
            source={{ uri: item.imageUrl || defaultImage }}
            style={styles.bookImage}
            defaultSource={{ uri: defaultImage }}
            onError={(e) => {
              console.log('Erreur de chargement d\'image:', e.nativeEvent.error);
            }}
          />
          <View style={styles.bookDetails}>
            <Text style={styles.bookTitle}>{item.title || 'Titre non disponible'}</Text>
            <Text style={styles.bookAuthor}>{item.author || 'Auteur inconnu'}</Text>
            <View style={styles.statusContainer}>
              {renderStatus(item.status)}
            </View>
          </View>
        </View>
        
        <View style={styles.dates}>
          <Text style={styles.dateLabel}>Demande: <Text style={styles.dateText}>{formatDate(item.request_date)}</Text></Text>
          
          {item.approval_date && (
            <Text style={styles.dateLabel}>
              {item.status === 'approved' ? 'Approbation: ' : 'Réponse: '}
              <Text style={styles.dateText}>{formatDate(item.approval_date)}</Text>
            </Text>
          )}
          
          {item.borrow_date && (
            <Text style={styles.dateLabel}>Emprunt: <Text style={styles.dateText}>{formatDate(item.borrow_date)}</Text></Text>
          )}
          
          {item.return_date && (
            <Text style={styles.dateLabel}>Retour: <Text style={styles.dateText}>{formatDate(item.return_date)}</Text></Text>
          )}
        </View>
        
        {item.status === 'pending' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => handleCancelRequest(item.id)}
          >
            <Ionicons name="close-circle-outline" size={20} color="white" />
            <Text style={styles.actionButtonText}>Annuler</Text>
          </TouchableOpacity>
        )}
        
        {item.status === 'borrowed' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.returnButton]}
            onPress={() => handleReturnBook(item.book_id)}
          >
            <Ionicons name="return-down-back-outline" size={20} color="white" />
            <Text style={styles.actionButtonText}>Retourner</Text>
          </TouchableOpacity>
        )}
        
        {(item.status === 'approved' || item.status === 'rejected' || item.status === 'returned') && (
          <View style={styles.completedStatus}>
            <Ionicons 
              name={item.status === 'approved' ? "checkmark-circle-outline" : 
                    item.status === 'rejected' ? "close-circle-outline" : "return-down-back-outline"} 
              size={20} 
              color={item.status === 'approved' ? "#38A169" : 
                     item.status === 'rejected' ? "#E53E3E" : "#718096"} 
            />
            <Text style={[
              styles.completedStatusText, 
              { color: item.status === 'approved' ? "#38A169" : 
                       item.status === 'rejected' ? "#E53E3E" : "#718096" }
            ]}>
              {item.status === 'approved' ? "En attente de retrait" : 
               item.status === 'rejected' ? "Demande rejetée" : "Livre retourné"}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* En-tête avec dégradé */}
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
        <Text style={styles.headerTitle}>Historique des emprunts</Text>
      </LinearGradient>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#4F6CE1" style={styles.loader} />
        ) : borrowHistory.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={60} color="#A0AEC0" />
            <Text style={styles.emptyText}>Vous n'avez pas encore d'historique d'emprunts</Text>
          </View>
        ) : (
          <FlatList
            data={borrowHistory}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderBorrowItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
      
      {/* Composant CustomAlert */}
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
  container: {
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
  content: {
    flex: 1,
    padding: 15,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 20,
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  borrowItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bookInfo: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  bookImage: {
    width: 80,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    resizeMode: 'cover',
  },
  bookDetails: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'flex-start',
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 5,
  },
  bookAuthor: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dates: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
    marginBottom: 15,
  },
  dateLabel: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 5,
  },
  dateText: {
    color: '#2D3748',
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 10,
  },
  cancelButton: {
    backgroundColor: '#E53E3E',
  },
  returnButton: {
    backgroundColor: '#4F6CE1',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 5,
  },
  completedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  completedStatusText: {
    marginLeft: 5,
    fontWeight: '500',
  },
});

export default BorrowHistoryScreen;