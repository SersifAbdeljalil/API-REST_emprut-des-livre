import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, Image, ActivityIndicator, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import CustomAlert from './CustomAlert';

const ProfileUserScreen = ({ navigation, route }) => {
  const [userData, setUserData] = useState({ 
    name: "Utilisateur", 
    email: "user@example.com",
    profileImage: "https://via.placeholder.com/150"
  });
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  
  // Ajout de l'état pour CustomAlert
  const [alert, setAlert] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'success',
    buttons: []
  });

  // Fonction pour récupérer les informations de l'utilisateur
  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        navigation.replace('Login');
        return;
      }
      
      // Appel API pour récupérer les données utilisateur
      const response = await fetch('http://192.168.1.172:5000/api/auth/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        // Ajouter un paramètre cache-bust pour éviter la mise en cache
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Données utilisateur récupérées:", data);
        
        // Ajouter un paramètre cache-bust à l'URL de l'image
        let imageUrl = data.profileImage || "https://via.placeholder.com/150";
        if (imageUrl.includes('?')) {
          imageUrl = imageUrl + '&t=' + Date.now();
        } else {
          imageUrl = imageUrl + '?t=' + Date.now();
        }
        
        setUserData({
          name: data.name,
          email: data.email,
          profileImage: imageUrl
        });
        
        setDebugInfo(`Profil chargé - Image: ${imageUrl}`);
      } else {
        console.error("Erreur de réponse:", await response.text());
        setAlert({
          visible: true,
          title: 'Erreur',
          message: 'Erreur lors de la récupération du profil',
          type: 'error',
          buttons: [{ text: 'OK', onPress: () => {} }]
        });
      }
    } catch (error) {
      console.error('Erreur:', error);
      setAlert({
        visible: true,
        title: 'Erreur',
        message: 'Problème lors de la récupération du profil',
        type: 'error',
        buttons: [{ text: 'OK', onPress: () => {} }]
      });
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  // UseEffect avec dépendance sur route.params pour détecter les changements de navigation
  useEffect(() => {
    console.log("ProfileUserScreen - useEffect déclenché", route.params);
    fetchUserData();
  }, [fetchUserData, route.params]);

  const handleLogout = async () => {
    // Utilisation de CustomAlert au lieu de Alert.alert
    setAlert({
      visible: true,
      title: 'Déconnexion',
      message: 'Êtes-vous sûr de vouloir vous déconnecter ?',
      type: 'warning',
      buttons: [
        {
          text: 'Annuler',
          onPress: () => {}
        },
        {
          text: 'Déconnecter',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('token');
              navigation.navigate('Login');
            } catch (error) {
              setAlert({
                visible: true,
                title: 'Erreur',
                message: 'Problème lors de la déconnexion',
                type: 'error',
                buttons: [{ text: 'OK', onPress: () => {} }]
              });
            }
          }
        }
      ]
    });
  };

  // Fonction corrigée pour la mise à jour de l'image de profil
  const handleChangeProfileImage = async () => {
    try {
      // Demander la permission d'accéder à la galerie
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setAlert({
          visible: true,
          title: "Permission refusée",
          message: "Nous avons besoin de la permission d'accéder à vos photos",
          type: 'error',
          buttons: [{ text: 'OK', onPress: () => {} }]
        });
        return;
      }

      // Lancer l'image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      // Si l'utilisateur a sélectionné une image
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setLoading(true);
        const imageUri = result.assets[0].uri;
        console.log("Image URI sélectionnée:", imageUri);
        
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          setLoading(false);
          setAlert({
            visible: true,
            title: "Erreur",
            message: "Session expirée, veuillez vous reconnecter",
            type: 'error',
            buttons: [{ text: 'OK', onPress: () => {} }]
          });
          return;
        }

        // On utilise directement une URL aléatoire pour tester
        const randomImageUrl = "https://randomuser.me/api/portraits/men/" + Math.floor(Math.random() * 99) + ".jpg";
        setDebugInfo(`Essai avec l'image: ${randomImageUrl}`);
        
        try {
          const response = await fetch('http://192.168.1.172:5000/api/auth/profile/image-url', {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ imageUrl: randomImageUrl })
          });
          
          const responseText = await response.text();
          setDebugInfo(prev => prev + `\nRéponse serveur: ${responseText}`);
          
          let data;
          try {
            data = JSON.parse(responseText);
          } catch (e) {
            console.error("Erreur parsing JSON:", e);
            setDebugInfo(prev => prev + `\nErreur JSON: ${e.message}`);
          }
          
          if (response.ok && data) {
            console.log("Mise à jour réussie:", data);
            setDebugInfo(prev => prev + `\nMise à jour OK: ${data.profileImage}`);
            
            // Mettre à jour l'UI immédiatement
            setUserData(prev => ({
              ...prev, 
              profileImage: data.profileImage || randomImageUrl
            }));
            
            setAlert({
              visible: true,
              title: "Succès",
              message: "Image de profil mise à jour avec succès",
              type: 'success',
              buttons: [{ 
                text: 'OK', 
                onPress: () => {
                  // Rafraîchir pour être sûr
                  setTimeout(() => fetchUserData(), 500);
                }
              }]
            });
          } else {
            console.error("Échec de la mise à jour:", data);
            setDebugInfo(prev => prev + `\nÉchec mise à jour: ${JSON.stringify(data)}`);
            setAlert({
              visible: true,
              title: "Erreur",
              message: "Impossible de mettre à jour l'image de profil",
              type: 'error',
              buttons: [{ text: 'OK', onPress: () => {} }]
            });
          }
        } catch (error) {
          console.error("Erreur:", error);
          setDebugInfo(prev => prev + `\nException: ${error.message}`);
          setAlert({
            visible: true,
            title: "Erreur",
            message: "Problème lors de la mise à jour de l'image",
            type: 'error',
            buttons: [{ text: 'OK', onPress: () => {} }]
          });
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error("Erreur lors du changement d'image:", error);
      setLoading(false);
      setDebugInfo(prev => prev + `\nErreur principale: ${error.message}`);
      setAlert({
        visible: true,
        title: "Erreur",
        message: "Un problème est survenu lors du changement d'image",
        type: 'error',
        buttons: [{ text: 'OK', onPress: () => {} }]
      });
    }
  };

  // Fonction de test direct avec une URL fixe pour déboguer
  const testDirectImageUpdate = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setLoading(false);
        setDebugInfo("Aucun token trouvé");
        return;
      }
      
      // Utiliser une URL simple et fixe pour tester
      const testImageUrl = "https://randomuser.me/api/portraits/women/" + Math.floor(Math.random() * 99) + ".jpg";
      setDebugInfo(`Test avec URL: ${testImageUrl}`);
      
      const response = await fetch('http://192.168.1.172:5000/api/auth/profile/image-url', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageUrl: testImageUrl })
      });
      
      const responseStatus = response.status;
      setDebugInfo(prev => prev + `\nStatut: ${responseStatus}`);
      
      const responseText = await response.text();
      setDebugInfo(prev => prev + `\nRéponse: ${responseText}`);
      
      try {
        const data = JSON.parse(responseText);
        setDebugInfo(prev => prev + `\nImage retournée: ${data.profileImage || 'non définie'}`);
        
        if (response.ok) {
          // Mettre à jour l'UI immédiatement
          setUserData(prev => ({
            ...prev, 
            profileImage: data.profileImage || testImageUrl
          }));
          
          // Forcer un rechargement après un court délai
          setTimeout(() => fetchUserData(), 1000);
        }
      } catch (e) {
        setDebugInfo(prev => prev + `\nErreur parsing: ${e.message}`);
      }
    } catch (error) {
      console.error("Erreur de test:", error);
      setDebugInfo(prev => prev + `\nException: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour vérifier l'état actuel de l'image dans la base de données
  const checkCurrentImage = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setLoading(false);
        setDebugInfo("Aucun token trouvé");
        return;
      }
      
      // Récupérer directement le profil
      const response = await fetch('http://192.168.1.172:5000/api/auth/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        setDebugInfo(`Image actuelle: ${data.profileImage}`);
      } else {
        setDebugInfo(`Erreur vérification: ${response.status}`);
      }
    } catch (error) {
      setDebugInfo(`Exception vérification: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      
      {/* En-tête avec dégradé */}
      <LinearGradient
        colors={['#3a416f', '#141727']}
        style={styles.headerGradient}
      >
        <Text style={styles.headerTitle}>Mon Profil</Text>
      </LinearGradient>

      <View style={styles.profileContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#4F6CE1" style={styles.loader} />
        ) : (
          <>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: userData.profileImage }}
                style={styles.avatar}
                onError={(e) => {
                  console.error("Erreur chargement image:", e.nativeEvent.error);
                  setDebugInfo(prev => prev + `\nErreur image: ${e.nativeEvent.error}`);
                }}
                onLoad={() => console.log("Image chargée:", userData.profileImage)}
              />
              <TouchableOpacity 
                style={styles.avatarEditButton}
                onPress={handleChangeProfileImage}
              >
                <Ionicons name="camera" size={20} color="white" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.userName}>{userData.name}</Text>
            <Text style={styles.userEmail}>{userData.email}</Text>

            {/* Boutons de débogage */}
            <View style={styles.debugButtonsContainer}>
              <TouchableOpacity
                style={styles.debugButton}
                onPress={testDirectImageUpdate}
              >
                <Text style={styles.debugButtonText}>TEST URL</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.debugButton, {backgroundColor: '#2E86C1'}]}
                onPress={checkCurrentImage}
              >
                <Text style={styles.debugButtonText}>VÉRIFIER</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.debugButton, {backgroundColor: '#27AE60'}]}
                onPress={fetchUserData}
              >
                <Text style={styles.debugButtonText}>RAFRAÎCHIR</Text>
              </TouchableOpacity>
            </View>
            
            {/* Zone d'information de débogage */}
            {debugInfo ? (
              <View style={styles.debugInfoContainer}>
                <Text style={styles.debugInfoTitle}>Infos de débogage:</Text>
                <Text style={styles.debugInfoText}>{debugInfo}</Text>
              </View>
            ) : null}

            <View style={styles.menuContainer}>
              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => navigation.navigate('EditProfile', { 
                  onGoBack: () => fetchUserData() 
                })}
              >
                <Ionicons name="person-outline" size={24} color="#4F6CE1" />
                <Text style={styles.menuItemText}>Modifier mon profil</Text>
                <Ionicons name="chevron-forward" size={20} color="#A0AEC0" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => navigation.navigate('BorrowHistory')}
              >
                <Ionicons name="book-outline" size={24} color="#4F6CE1" />
                <Text style={styles.menuItemText}>Historique des emprunts</Text>
                <Ionicons name="chevron-forward" size={20} color="#A0AEC0" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => navigation.navigate('Settings')}
              >
                <Ionicons name="settings-outline" size={24} color="#4F6CE1" />
                <Text style={styles.menuItemText}>Paramètres</Text>
                <Ionicons name="chevron-forward" size={20} color="#A0AEC0" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={24} color="#E53E3E" />
                <Text style={[styles.menuItemText, { color: '#E53E3E' }]}>Déconnexion</Text>
                <Ionicons name="chevron-forward" size={20} color="#A0AEC0" />
              </TouchableOpacity>
            </View>
          </>
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
    </ScrollView>
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
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  profileContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loader: {
    marginTop: 40,
  },
  avatarContainer: {
    marginTop: 20,
    marginBottom: 20,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#4F6CE1',
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4F6CE1',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#4A5568',
    marginBottom: 15,
  },
  menuContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginTop: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  menuItemText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: '#2D3748',
  },
  // Styles pour les fonctionnalités de débogage
  debugButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  debugButton: {
    backgroundColor: '#E74C3C',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  debugButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  debugInfoContainer: {
    backgroundColor: '#2C3E50',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    marginBottom: 15,
  },
  debugInfoTitle: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  debugInfoText: {
    color: '#EEEEEE',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  }
});
export default ProfileUserScreen;