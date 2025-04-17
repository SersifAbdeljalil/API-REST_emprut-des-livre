import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const ProfileUserScreen = ({ navigation }) => {
  const [userData, setUserData] = useState({ 
    name: "Utilisateur", 
    email: "user@example.com",
    profileImage: "https://via.placeholder.com/150"
  });
  const [loading, setLoading] = useState(false);

  // Fonction pour récupérer les informations de l'utilisateur
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        navigation.replace('Login');
        return;
      }
      
      // Appel API pour récupérer les données utilisateur
      const response = await fetch('http://192.168.11.119:5000/api/auth/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserData({
          name: data.name,
          email: data.email,
          profileImage: data.profileImage || "https://via.placeholder.com/150"
        });
      } else {
        // Gérer les erreurs
        console.error('Erreur lors de la récupération du profil');
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Déconnecter',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('token');
              navigation.navigate('Login');
            } catch (error) {
              Alert.alert('Erreur', 'Problème lors de la déconnexion');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleChangeProfileImage = async () => {
    try {
      // Demander la permission d'accéder à la galerie
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission refusée", "Nous avons besoin de la permission d'accéder à vos photos");
        return;
      }

      // Lancer l'image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Ici, vous devriez normalement téléverser l'image sur un serveur et obtenir une URL en retour
        // Pour cet exemple, nous allons simplement simuler une mise à jour avec l'URI local
        
        setLoading(true);
        const token = await AsyncStorage.getItem('token');
        
        // Dans une application réelle, vous devriez télécharger l'image sur un service comme AWS S3
        // et obtenir une URL publique en retour. Pour l'exemple, nous simulerons cela.
        
        // Simulons une mise à jour de l'image de profil
        const imageUrl = result.assets[0].uri;
        
        // Appel API pour mettre à jour l'image de profil
        const response = await fetch('http://192.168.11.119:5000/api/auth/users/profile/image', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ imageUrl })
        });
        
        if (response.ok) {
          setUserData(prev => ({...prev, profileImage: imageUrl}));
          Alert.alert("Succès", "Image de profil mise à jour avec succès");
        } else {
          Alert.alert("Erreur", "Impossible de mettre à jour l'image de profil");
        }
        setLoading(false);
      }
    } catch (error) {
      console.error("Erreur lors du changement d'image:", error);
      setLoading(false);
      Alert.alert("Erreur", "Un problème est survenu lors du changement d'image");
    }
  };

  return (
    <View style={styles.mainContainer}>
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

            <View style={styles.menuContainer}>
              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => navigation.navigate('EditProfile')}
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
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  profileContainer: {
    flex: 1,
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
    marginBottom: 30,
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
});

export default ProfileUserScreen;