import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HomeScreen = ({ navigation }) => {
    const handleLogout = async () => {
        await AsyncStorage.removeItem("token"); // Supprimer le token
        navigation.navigate("Login"); // Rediriger vers l'écran de connexion
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bienvenue sur l'écran d'accueil</Text>
            <Button title="Se déconnecter" onPress={handleLogout} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        marginBottom: 16,
    },
});

export default HomeScreen;