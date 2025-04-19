import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from './CustomAlert';

const EditProfile = ({ navigation, route }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [alert, setAlert] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'success',
    buttons: []
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        navigation.replace('Login');
        return;
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
        setName(data.name);
        setEmail(data.email);
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
  };

  const handleSave = async () => {
    // Validation simple
    if (!name.trim() || !email.trim()) {
      setAlert({
        visible: true,
        title: 'Attention',
        message: 'Veuillez remplir tous les champs',
        type: 'warning',
        buttons: [{ text: 'OK', onPress: () => {} }]
      });
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      const response = await fetch('http://192.168.1.172:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email })
      });
      
      const data = await response.json();
      console.log("Réponse de mise à jour:", data);
      
      if (response.ok) {
        setAlert({
          visible: true,
          title: 'Succès',
          message: 'Profil mis à jour avec succès',
          type: 'success',
          buttons: [{ 
            text: 'OK', 
            onPress: () => {
              // Appeler le callback si fourni
              if (route.params?.onGoBack) {
                route.params.onGoBack();
              }
              
              // Retourner simplement à l'écran précédent
              navigation.goBack();
            } 
          }]
        });
      } else {
        setAlert({
          visible: true,
          title: 'Erreur',
          message: data.message || 'Erreur lors de la mise à jour du profil',
          type: 'error',
          buttons: [{ text: 'OK', onPress: () => {} }]
        });
      }
    } catch (error) {
      console.error('Erreur:', error);
      setAlert({
        visible: true,
        title: 'Erreur',
        message: 'Problème lors de la mise à jour du profil',
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
        <Text style={styles.headerTitle}>Modifier mon profil</Text>
      </LinearGradient>

      <View style={styles.formContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#4F6CE1" style={styles.loader} />
        ) : (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Votre nom"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Votre email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Enregistrer</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

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
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  loader: {
    marginTop: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  saveButton: {
    backgroundColor: '#4F6CE1',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfile;