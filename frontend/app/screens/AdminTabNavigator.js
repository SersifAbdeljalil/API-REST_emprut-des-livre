import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';


import HomeScreen from './HomeScreen';
import AdminBorrowManagementScreen from'./AdminBorrowManagementScreen'; 
import styles from '../Styles/AdminTabNavigator';
const Tab = createBottomTabNavigator();

const AdminTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
         
          if (route.name === 'AdminHome') {
            iconName = focused ? 'library' : 'library-outline';
          } else if (route.name === 'BorrowManagement') {
            iconName = focused ? 'book' : 'book-outline';
          }
         
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4F6CE1',
        tabBarInactiveTintColor: '#A0AEC0',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="AdminHome"
        component={HomeScreen}
        options={{ tabBarLabel: 'Bibliothèque' }}
      />
      <Tab.Screen
        name="BorrowManagement"
        component={AdminBorrowManagementScreen}
        options={{ tabBarLabel: 'Emprunts' }}
      />
    </Tab.Navigator>
  );
};


export default AdminTabNavigator;