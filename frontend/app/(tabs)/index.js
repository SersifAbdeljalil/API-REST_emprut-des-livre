// Index.js
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
import LoadingScreen from "../screens/LoadingScreen"; // Importez LoadingScreen

const Stack = createStackNavigator();

export default function Index() {
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState(null);

    useEffect(() => {
        const checkToken = async () => {
            const token = await AsyncStorage.getItem("token");
            setUserToken(token);
            setIsLoading(false);
        };
        checkToken();
    }, []);

    if (isLoading) {
        return <LoadingScreen />; // Utilisez LoadingScreen ici
    }

    return (
        
            <Stack.Navigator
                initialRouteName={userToken ? "Home" : "Login"}
                screenOptions={{
                    headerStyle: {
                        backgroundColor: '#2196F3',
                    },
                    headerTintColor: '#fff',
                }}>
                <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
                <Stack.Screen name="AddBook" component={AddBookScreen} options={{ title: "Ajouter un livre" }} />
                <Stack.Screen name="EditBook" component={EditBookScreen} options={{ title: "Modifier le livre" }} />
                <Stack.Screen
                    name="BookDetails"
                    component={BookDetailsScreen}
                    options={({ route }) => ({ title: route.params?.title || "Détails du livre" })}
                />
            </Stack.Navigator>
       
    );
}