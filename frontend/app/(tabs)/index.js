import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "./HomeScreen";

const Stack = createStackNavigator();

export default function Index() {
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState(null);

    useEffect(() => {
        const checkToken = async () => {
            const token = await AsyncStorage.getItem("token");
            console.log("Token récupéré:", token); // Debug log
            setUserToken(token);
            setIsLoading(false);
        };
        checkToken();
    }, []);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <Stack.Navigator>
     <>
                <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }}/>
                <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
                </>       
        </Stack.Navigator>
    );
}