import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from "react-native";
import axios from "axios";
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from "@react-navigation/native";
import CustomAlert from './CustomAlert';

const ResetPasswordScreen = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  
  // État pour CustomAlert
  const [alert, setAlert] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'success',
    buttons: []
  });

  const navigation = useNavigation();
  const route = useRoute();
  const { token } = route.params || {}; // Récupérer le token depuis les paramètres

  // Valider que le token est présent
  useEffect(() => {
    if (!token) {
      setAlert({
        visible: true,
        title: "Erreur",
        message: "Lien de réinitialisation invalide ou expiré.",
        type: "error",
        buttons: [{ 
          text: "OK", 
          onPress: () => navigation.navigate("Login")
        }]
      });
    }
  }, [token, navigation]);

  const validateForm = () => {
    let isValid = true;

    // Validation du mot de passe
    if (!newPassword) {
      setPasswordError("Le mot de passe est requis");
      isValid = false;
    } else if (newPassword.length < 6) {
      setPasswordError("Le mot de passe doit contenir au moins 6 caractères");
      isValid = false;
    } else {
      setPasswordError("");
    }

    // Validation de la confirmation du mot de passe
    if (!confirmPassword) {
      setConfirmPasswordError("Veuillez confirmer votre mot de passe");
      isValid = false;
    } else if (confirmPassword !== newPassword) {
      setConfirmPasswordError("Les mots de passe ne correspondent pas");
      isValid = false;
    } else {
      setConfirmPasswordError("");
    }

    return isValid;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await axios.post("http://192.168.1.172:5000/api/auth/reset-password", {
        token,
        newPassword
      });

      setIsLoading(false);

      setAlert({
        visible: true,
        title: "Succès",
        message: "Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.",
        type: "success",
        buttons: [{ 
          text: "OK", 
          onPress: () => navigation.navigate("Login")
        }]
      });
    } catch (error) {
      console.error("Erreur:", error);
      
      let errorMessage = "Impossible de réinitialiser le mot de passe. Veuillez réessayer.";
      if (error.response && error.response.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setAlert({
        visible: true,
        title: "Erreur",
        message: errorMessage,
        type: "error",
        buttons: [{ text: "OK", onPress: () => {} }]
      });
      
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#f6f7fb" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate("Login")}
          >
            <Ionicons name="arrow-back" size={24} color="#3a416f" />
          </TouchableOpacity>

          <View style={styles.header}>
            <LinearGradient
              colors={['#3a416f', '#141727']}
              style={styles.iconContainer}
            >
              <MaterialIcons name="lock-reset" size={32} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.title}>Réinitialiser le mot de passe</Text>
            <Text style={styles.subtitle}>
              Créez un nouveau mot de passe pour sécuriser votre compte
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Nouveau mot de passe</Text>
              <View style={[styles.inputContainer, passwordError ? styles.inputError : null]}>
                <MaterialIcons name="lock" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Entrez votre nouveau mot de passe"
                  placeholderTextColor="#999"
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    if (text && text.length >= 6) setPasswordError("");
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Confirmer le mot de passe</Text>
              <View style={[styles.inputContainer, confirmPasswordError ? styles.inputError : null]}>
                <MaterialIcons name="lock" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirmez votre mot de passe"
                  placeholderTextColor="#999"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (text === newPassword) setConfirmPasswordError("");
                  }}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
            </View>

            <TouchableOpacity
              disabled={isLoading}
              onPress={handleResetPassword}
              style={styles.buttonContainer}
            >
              <LinearGradient
                colors={['#2B6CB0', '#1A365D']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <View style={styles.buttonContent}>
                    <MaterialIcons name="lock-reset" size={16} color="#FFFFFF" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>RÉINITIALISER</Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.loginText}>
              Retour à la <Text style={styles.loginTextBold}>connexion</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Composant CustomAlert */}
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        buttons={alert.buttons}
        onClose={() => setAlert(prev => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f7fb",
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
  },
  backButton: {
    marginBottom: 16,
    padding: 8,
    alignSelf: 'flex-start',
  },
  header: {
    alignItems: "center",
    marginVertical: 24,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#141727",
    letterSpacing: 0.3,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#4A5568",
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
    marginVertical: 24,
  },
  inputWrapper: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A5568",
    marginBottom: 8,
    paddingLeft: 2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    backgroundColor: "#F7FAFC",
    height: 50,
  },
  inputError: {
    borderColor: "#E53E3E",
  },
  inputIcon: {
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    color: "#2D3748",
    fontSize: 15,
  },
  passwordToggle: {
    paddingHorizontal: 16,
  },
  errorText: {
    color: "#E53E3E",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  passwordStrength: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  strengthIndicator: {
    height: 4,
    borderRadius: 2,
    flex: 1,
    marginRight: 4,
  },
  strengthText: {
    fontSize: 12,
    marginLeft: 4,
  },
  buttonContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  button: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginLink: {
    alignItems: "center",
    padding: 16,
  },
  loginText: {
    fontSize: 16,
    color: "#4A5568",
  },
  loginTextBold: {
    fontWeight: "bold",
    color: "#3a416f",
  },
});

export default ResetPasswordScreen;