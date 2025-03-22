import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const StatusBooksScreen = () => {
  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      
      {/* En-tête avec dégradé */}
      <LinearGradient
        colors={['#3a416f', '#141727']}
        style={styles.headerGradient}
      >
        <Text style={styles.headerTitle}>Statut des Livres</Text>
      </LinearGradient>

      <View style={styles.container}>
        <Text style={styles.contentText}>
          Ici vous pourrez voir le statut de vos livres (emprunts, retours, etc.)
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f6f7fb',
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentText: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
  },
});

export default StatusBooksScreen;