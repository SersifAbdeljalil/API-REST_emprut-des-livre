import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import AddBookScreen from "../screens/AddBookScreen";
import EditBookScreen from "../screens/EditBookScreen";
import BookDetailsScreen from "../screens/BookDetailsScreen";
import LoadingScreen from "../screens/LoadingScreen";
import BookDetailsScreenUser from "../screens/BookDetailsUserScreen";
import TabNavigator from "../screens/TabNavigator";

const Stack = createStackNavigator();

export default function Index() {
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState(null);
    const [userRole, setUserRole] = useState(null); // Pour gérer différents rôles si nécessaire

    useEffect(() => {
        const checkToken = async () => {
            try {
                const token = await AsyncStorage.getItem("token");
                const role = await AsyncStorage.getItem("userRole"); // Supposons que vous stockez le rôle
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
            initialRouteName={userToken ? (userRole === "admin" ? "Home" : "UserTabs") : "Login"}
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#2196F3',
                },
                headerTintColor: '#fff',
            }}>
            {/* Écrans d'authentification */}
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
            
            {/* Écrans administrateur */}
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
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
            
            {/* Écran de détails accessible depuis la navigation par onglets */}
            <Stack.Screen 
                name="DetailsUser" 
                component={BookDetailsScreenUser} 
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}