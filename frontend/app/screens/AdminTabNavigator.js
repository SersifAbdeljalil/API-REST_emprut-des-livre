import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

// Importez vos écrans d'administration
import HomeScreen from './HomeScreen'; // La page d'accueil admin existante
import AdminBorrowManagementScreen from './AdminBorrowManagementScreen'; // La page de gestion des emprunts

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

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'white',
    borderTopWidth: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    height: 60,
    paddingBottom: 5,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default AdminTabNavigator;