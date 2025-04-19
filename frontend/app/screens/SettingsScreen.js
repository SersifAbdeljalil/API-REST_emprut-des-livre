import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from './CustomAlert';

const SettingsScreen = ({ navigation }) => {
  // États des paramètres
  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    darkMode: false,
    language: 'fr',
    autoSync: true,
  });
  
  const [loading, setLoading] = useState(true);
  
  // État pour CustomAlert
  const [alert, setAlert] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'success',
    buttons: []
  });

  // Simuler le chargement des paramètres depuis le stockage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Dans une application réelle, vous chargeriez les paramètres depuis AsyncStorage
        // Ou depuis une API
        const storedSettings = await AsyncStorage.getItem('userSettings');
        if (storedSettings) {
          setSettings(JSON.parse(storedSettings));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  // Mettre à jour un paramètre
  const updateSetting = async (key, value) => {
    try {
      const updatedSettings = { ...settings, [key]: value };
      setSettings(updatedSettings);
      
      // Sauvegarder les paramètres dans AsyncStorage
      await AsyncStorage.setItem('userSettings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres:', error);
      setAlert({
        visible: true,
        title: 'Erreur',
        message: 'Impossible de sauvegarder les paramètres',
        type: 'error',
        buttons: [{ text: 'OK', onPress: () => {} }]
      });
    }
  };

  // Réinitialiser les paramètres
  const resetSettings = async () => {
    setAlert({
      visible: true,
      title: 'Réinitialisation',
      message: 'Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?',
      type: 'warning',
      buttons: [
        {
          text: 'Annuler',
          onPress: () => {}
        },
        {
          text: 'Réinitialiser',
          onPress: async () => {
            try {
              const defaultSettings = {
                notificationsEnabled: true,
                darkMode: false,
                language: 'fr',
                autoSync: true,
              };
              
              setSettings(defaultSettings);
              await AsyncStorage.setItem('userSettings', JSON.stringify(defaultSettings));
              
              setAlert({
                visible: true,
                title: 'Succès',
                message: 'Paramètres réinitialisés avec succès',
                type: 'success',
                buttons: [{ text: 'OK', onPress: () => {} }]
              });
            } catch (error) {
              console.error('Erreur lors de la réinitialisation des paramètres:', error);
              setAlert({
                visible: true,
                title: 'Erreur',
                message: 'Impossible de réinitialiser les paramètres',
                type: 'error',
                buttons: [{ text: 'OK', onPress: () => {} }]
              });
            }
          }
        }
      ]
    });
  };

  // Afficher la politique de confidentialité
  const showPrivacyPolicy = () => {
    // Dans une application réelle, vous naviguerez vers un écran spécifique
    setAlert({
      visible: true,
      title: 'Politique de confidentialité',
      message: 'La politique de confidentialité détaillée serait affichée ici. Pour l\'instant, c\'est juste un exemple.',
      type: 'info',
      buttons: [{ text: 'OK', onPress: () => {} }]
    });
  };

  // Afficher les conditions d'utilisation
  const showTermsOfUse = () => {
    // Dans une application réelle, vous naviguerez vers un écran spécifique
    setAlert({
      visible: true,
      title: 'Conditions d\'utilisation',
      message: 'Les conditions d\'utilisation détaillées seraient affichées ici. Pour l\'instant, c\'est juste un exemple.',
      type: 'info',
      buttons: [{ text: 'OK', onPress: () => {} }]
    });
  };

  // Afficher les informations de l'application
  const showAbout = () => {
    setAlert({
      visible: true,
      title: 'À propos de l\'application',
      message: 'Version 1.0.0\nDéveloppée par votre équipe\n© 2024 Tous droits réservés',
      type: 'info',
      buttons: [{ text: 'OK', onPress: () => {} }]
    });
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
        <Text style={styles.headerTitle}>Paramètres</Text>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator size="large" color="#4F6CE1" style={styles.loader} />
      ) : (
        <ScrollView style={styles.content}>
          {/* Section Général */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Général</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="notifications-outline" size={22} color="#4F6CE1" />
                <Text style={styles.settingText}>Notifications</Text>
              </View>
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={(value) => updateSetting('notificationsEnabled', value)}
                trackColor={{ false: '#D1D5DB', true: '#4F6CE1' }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="moon-outline" size={22} color="#4F6CE1" />
                <Text style={styles.settingText}>Mode sombre</Text>
              </View>
              <Switch
                value={settings.darkMode}
                onValueChange={(value) => updateSetting('darkMode', value)}
                trackColor={{ false: '#D1D5DB', true: '#4F6CE1' }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => {
                setAlert({
                  visible: true,
                  title: 'Langue',
                  message: 'Cette fonctionnalité n\'est pas encore disponible',
                  type: 'info',
                  buttons: [{ text: 'OK', onPress: () => {} }]
                });
              }}
            >
              <View style={styles.settingInfo}>
                <Ionicons name="language-outline" size={22} color="#4F6CE1" />
                <Text style={styles.settingText}>Langue</Text>
              </View>
              <View style={styles.valueContainer}>
                <Text style={styles.valueText}>Français</Text>
                <Ionicons name="chevron-forward" size={20} color="#A0AEC0" />
              </View>
            </TouchableOpacity>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="sync-outline" size={22} color="#4F6CE1" />
                <Text style={styles.settingText}>Synchronisation automatique</Text>
              </View>
              <Switch
                value={settings.autoSync}
                onValueChange={(value) => updateSetting('autoSync', value)}
                trackColor={{ false: '#D1D5DB', true: '#4F6CE1' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
          
          {/* Section Compte */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Compte</Text>
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <View style={styles.settingInfo}>
                <Ionicons name="person-outline" size={22} color="#4F6CE1" />
                <Text style={styles.settingText}>Modifier le profil</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#A0AEC0" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => navigation.navigate('ChangePassword')}
            >
              <View style={styles.settingInfo}>
                <Ionicons name="lock-closed-outline" size={22} color="#4F6CE1" />
                <Text style={styles.settingText}>Changer le mot de passe</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#A0AEC0" />
            </TouchableOpacity>
          </View>
          
          {/* Section Informations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations</Text>
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={showPrivacyPolicy}
            >
              <View style={styles.settingInfo}>
                <Ionicons name="shield-outline" size={22} color="#4F6CE1" />
                <Text style={styles.settingText}>Politique de confidentialité</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#A0AEC0" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={showTermsOfUse}
            >
              <View style={styles.settingInfo}>
                <Ionicons name="document-text-outline" size={22} color="#4F6CE1" />
                <Text style={styles.settingText}>Conditions d'utilisation</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#A0AEC0" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={showAbout}
            >
              <View style={styles.settingInfo}>
                <Ionicons name="information-circle-outline" size={22} color="#4F6CE1" />
                <Text style={styles.settingText}>À propos</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#A0AEC0" />
            </TouchableOpacity>
          </View>
          
          {/* Actions */}
          <View style={styles.section}>
            <TouchableOpacity 
              style={[styles.button, styles.resetButton]}
              onPress={resetSettings}
            >
              <Ionicons name="refresh-outline" size={20} color="#4F6CE1" />
              <Text style={styles.resetButtonText}>Réinitialiser les paramètres</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
      
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
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: '#2D3748',
    marginLeft: 15,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 14,
    color: '#718096',
    marginRight: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
  },
  resetButton: {
    backgroundColor: '#EDF2F7',
  },
  resetButtonText: {
    color: '#4F6CE1',
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default SettingsScreen;