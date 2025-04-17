import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Écrans d'authentification
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import LoadingScreen from "../screens/LoadingScreen";

// Écrans et navigateurs
import AddBookScreen from "../screens/AddBookScreen";
import EditBookScreen from "../screens/EditBookScreen";
import BookDetailsScreen from "../screens/BookDetailsScreen";
import BookDetailsScreenUser from "../screens/BookDetailsUserScreen";
import TabNavigator from "../screens/TabNavigator"; // Pour les utilisateurs
import AdminTabNavigator from "../screens/AdminTabNavigator"; // Nouveau TabNavigator pour les admins
import PDFViewerScreen from "../screens/PdfViewerScreen";
const Stack = createStackNavigator();

export default function Index() {
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState(null);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const checkToken = async () => {
            try {
                const token = await AsyncStorage.getItem("token");
                const role = await AsyncStorage.getItem("userRole");
                setUserToken(token);
                setUserRole(role);
            } catch (error) {
                console.error("Erreur lors de la récupération des données:", error);
            } finally {
                setIsLoading(false);
            }
        };
        checkToken();
    }, []);

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#2196F3',
                },
                headerTintColor: '#fff',
            }}>
            {/* Écrans d'authentification */}
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
           
            {/* Navigation par onglets pour les administrateurs */}
            <Stack.Screen
                name="AdminTabs"
                component={AdminTabNavigator}
                options={{ headerShown: false }}
            />
            
            {/* Écrans administrateur accessibles depuis la navigation */}
            <Stack.Screen name="AddBook" component={AddBookScreen} options={{ headerShown: false }} />
            <Stack.Screen name="EditBook" component={EditBookScreen} options={{ headerShown: false }} />
            <Stack.Screen
                name="BookDetails"
                component={BookDetailsScreen}
                options={{ headerShown: false }}
            />
           
            {/* Navigation par onglets pour les utilisateurs */}
            <Stack.Screen
                name="UserTabs"
                component={TabNavigator}
                options={{ headerShown: false }}
            />
           
            {/* Écran de détails accessible depuis la navigation par onglets utilisateur */}
            <Stack.Screen
                name="DetailsUser"
                component={BookDetailsScreenUser}
                options={{ headerShown: false }}
            />
            <Stack.Screen name="PDFViewerScreen" component={PDFViewerScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}