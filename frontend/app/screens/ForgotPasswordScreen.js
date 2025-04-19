import React, { useState } from "react";
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
import { useNavigation } from "@react-navigation/native";
import CustomAlert from './CustomAlert';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  
  // État pour CustomAlert
  const [alert, setAlert] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'success',
    buttons: []
  });

  const navigation = useNavigation();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    let isValid = true;

    if (!email.trim()) {
      setEmailError("L'email est requis");
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError("Veuillez entrer un email valide");
      isValid = false;
    } else {
      setEmailError("");
    }

    return isValid;
  };

  const handleSendResetLink = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await axios.post("http://192.168.1.172:5000/api/auth/forgot-password", {
        email,
      });

      setIsLoading(false);

      setAlert({
        visible: true,
        title: "Email envoyé",
        message: "Si cette adresse email existe dans notre système, vous recevrez un lien pour réinitialiser votre mot de passe.",
        type: "success",
        buttons: [{ 
          text: "OK", 
          onPress: () => navigation.navigate("Login")
        }]
      });
    } catch (error) {
      console.error("Erreur:", error);
      
      // Même en cas d'erreur, ne pas révéler si l'email existe ou non (sécurité)
      setAlert({
        visible: true,
        title: "Email envoyé",
        message: "Si cette adresse email existe dans notre système, vous recevrez un lien pour réinitialiser votre mot de passe.",
        type: "success",
        buttons: [{ 
          text: "OK", 
          onPress: () => navigation.navigate("Login")
        }]
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
            onPress={() => navigation.goBack()}
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
            <Text style={styles.title}>Mot de passe oublié</Text>
            <Text style={styles.subtitle}>
              Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Adresse email</Text>
              <View style={[styles.inputContainer, emailError ? styles.inputError : null]}>
                <MaterialIcons name="email" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Entrez votre email"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (validateEmail(text)) setEmailError("");
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            </View>

            <TouchableOpacity
              disabled={isLoading}
              onPress={handleSendResetLink}
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
                    <MaterialIcons name="send" size={16} color="#FFFFFF" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>ENVOYER LE LIEN</Text>
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
  errorText: {
    color: "#E53E3E",
    fontSize: 12,
    marginTop: 4,
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

export default ForgotPasswordScreen;