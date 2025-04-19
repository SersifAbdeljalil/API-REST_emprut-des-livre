import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from './CustomAlert';

const ChangePasswordScreen = ({ navigation }) => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // État pour CustomAlert
  const [alert, setAlert] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'success',
    buttons: []
  });

  // Mise à jour du mot de passe
  const handleChangePassword = async () => {
    // Vérification des champs
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setAlert({
        visible: true,
        title: 'Erreur',
        message: 'Tous les champs sont obligatoires',
        type: 'error',
        buttons: [{ text: 'OK', onPress: () => {} }]
      });
      return;
    }

    // Vérification de la correspondance des mots de passe
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setAlert({
        visible: true,
        title: 'Erreur',
        message: 'Le nouveau mot de passe et sa confirmation ne correspondent pas',
        type: 'error',
        buttons: [{ text: 'OK', onPress: () => {} }]
      });
      return;
    }

    // Vérification de la longueur du mot de passe
    if (passwordData.newPassword.length < 6) {
      setAlert({
        visible: true,
        title: 'Erreur',
        message: 'Le nouveau mot de passe doit contenir au moins 6 caractères',
        type: 'error',
        buttons: [{ text: 'OK', onPress: () => {} }]
      });
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      const response = await fetch('http://192.168.1.172:5000/api/auth/password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      
      if (response.ok) {
        setAlert({
          visible: true,
          title: 'Succès',
          message: 'Mot de passe mis à jour avec succès',
          type: 'success',
          buttons: [{ 
            text: 'OK', 
            onPress: () => {
              navigation.goBack();
            } 
          }]
        });
        // Réinitialiser les champs
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        const errorData = await response.json();
        setAlert({
          visible: true,
          title: 'Erreur',
          message: errorData.message || 'Erreur lors de la mise à jour du mot de passe',
          type: 'error',
          buttons: [{ text: 'OK', onPress: () => {} }]
        });
      }
    } catch (error) {
      console.error('Erreur:', error);
      setAlert({
        visible: true,
        title: 'Erreur',
        message: 'Problème lors de la mise à jour du mot de passe',
        type: 'error',
        buttons: [{ text: 'OK', onPress: () => {} }]
      });
    } finally {
      setLoading(false);
    }
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
        <Text style={styles.headerTitle}>Changer le mot de passe</Text>
      </LinearGradient>

      <ScrollView style={styles.formContainer}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mot de passe actuel</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                value={passwordData.currentPassword}
                onChangeText={text => setPasswordData({...passwordData, currentPassword: text})}
                placeholder="Votre mot de passe actuel"
                secureTextEntry={!showCurrentPassword}
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                <Ionicons 
                  name={showCurrentPassword ? "eye-off-outline" : "eye-outline"} 
                  size={24} 
                  color="#4A5568" 
                />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nouveau mot de passe</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                value={passwordData.newPassword}
                onChangeText={text => setPasswordData({...passwordData, newPassword: text})}
                placeholder="Votre nouveau mot de passe"
                secureTextEntry={!showNewPassword}
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Ionicons 
                  name={showNewPassword ? "eye-off-outline" : "eye-outline"} 
                  size={24} 
                  color="#4A5568" 
                />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmer le nouveau mot de passe</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                value={passwordData.confirmPassword}
                onChangeText={text => setPasswordData({...passwordData, confirmPassword: text})}
                placeholder="Confirmer votre nouveau mot de passe"
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                  size={24} 
                  color="#4A5568" 
                />
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleChangePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Changer le mot de passe</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      
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
  formContainer: {
    flex: 1,
    padding: 20,
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#4A5568',
    marginBottom: 8,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  submitButton: {
    backgroundColor: '#4F6CE1',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChangePasswordScreen;