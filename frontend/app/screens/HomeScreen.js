import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    Alert,
    RefreshControl,
    ActivityIndicator,
    StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const HomeScreen = ({ navigation }) => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchBooks = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                navigation.replace('Login');
                return;
            }
            
            const response = await fetch('http://192.168.11.102:5000/api/books', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Erreur de serveur');
            }
            
            const data = await response.json();
            setBooks(data);
        } catch (error) {
            console.error('Erreur:', error);
            Alert.alert('Erreur', 'Impossible de charger les livres');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchBooks();
        // Écouteur pour rafraîchir la liste quand on revient sur l'écran
        const unsubscribe = navigation.addListener('focus', () => {
            fetchBooks();
        });

        return unsubscribe;
    }, [navigation]);

    const handleLogout = async () => {
        Alert.alert(
            'Déconnexion',
            'Êtes-vous sûr de vouloir vous déconnecter ?',
            [
                {
                    text: 'Annuler',
                    style: 'cancel',
                },
                {
                    text: 'Déconnecter',
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem('token');
                            navigation.replace('Login');
                        } catch (error) {
                            Alert.alert('Erreur', 'Problème lors de la déconnexion');
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const renderBookItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.bookCard}
            onPress={() => navigation.navigate('BookDetails', { bookId: item.id })}
            activeOpacity={0.7}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: item.image_url ? `http://192.168.11.102:5000/${item.image_url}` : 'https://via.placeholder.com/150' }}
                    style={styles.bookImage}
                    resizeMode="cover"
                />
                {/* Badge pour indiquer un nouveau livre (optionnel) */}
                {item.createdAt && new Date(item.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                    <View style={styles.newBadge}>
                        <Text style={styles.newBadgeText}>Nouveau</Text>
                    </View>
                )}
            </View>
            <View style={styles.bookInfo}>
                <Text style={styles.bookTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.bookAuthor} numberOfLines={1}>{item.author}</Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <StatusBar barStyle="light-content" />
                <ActivityIndicator size="large" color="#4F6CE1" />
                <Text style={styles.loadingText}>Chargement de votre bibliothèque...</Text>
            </View>
        );
    }

    return (
        <View style={styles.mainContainer}>
            <StatusBar barStyle="light-content" />
            
            {/* En-tête avec dégradé */}
            <LinearGradient
                colors={['#3a416f', '#141727']}
                style={styles.headerGradient}
            >
                <Text style={styles.headerTitle}>Ma Bibliothèque</Text>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Ionicons name="log-out-outline" size={24} color="white" />
                </TouchableOpacity>
            </LinearGradient>

            <View style={styles.container}>
                <FlatList
                    data={books}
                    renderItem={renderBookItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.bookList}
                    numColumns={2}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true);
                                fetchBooks();
                            }}
                            colors={["#4F6CE1"]}
                            tintColor="#4F6CE1"
                        />
                    }
                    ListEmptyComponent={() => (
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIconContainer}>
                                <Ionicons name="book-outline" size={60} color="#A0AEC0" />
                            </View>
                            <Text style={styles.emptyTitle}>Aucun livre trouvé</Text>
                            <Text style={styles.emptyText}>
                                Votre bibliothèque est vide. Ajoutez des livres en cliquant sur le bouton ci-dessous.
                            </Text>
                        </View>
                    )}
                    showsVerticalScrollIndicator={false}
                />
            </View>

            {/* Bouton d'ajout avec dégradé */}
            <TouchableOpacity 
                style={styles.addButton}
                onPress={() => navigation.navigate('AddBook')}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={['#4F6CE1', '#7D55F3']}
                    style={styles.addButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Ionicons name="add" size={30} color="white" />
                </LinearGradient>
            </TouchableOpacity>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
    },
    logoutButton: {
        padding: 8,
    },
    container: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f6f7fb',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#4F6CE1',
        fontWeight: '500',
    },
    bookList: {
        padding: 15,
        paddingBottom: 80,
    },
    bookCard: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 15,
        margin: 8,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        borderColor: '#E2E8F0',
        borderWidth: 1,
        height: 250,
    },
    imageContainer: {
        position: 'relative',
        height: 180,
    },
    bookImage: {
        width: '100%',
        height: '100%',
    },
    newBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#4F6CE1',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    newBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    bookInfo: {
        padding: 12,
    },
    bookTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
        color: '#2D3748',
    },
    bookAuthor: {
        fontSize: 14,
        color: '#4A5568',
        fontWeight: '500',
    },
    addButton: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 60,
        height: 60,
        borderRadius: 30,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        overflow: 'hidden',
    },
    addButtonGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 30,
        height: 400,
        justifyContent: 'center',
    },
    emptyIconContainer: {
        backgroundColor: 'rgba(160, 174, 192, 0.1)',
        padding: 20,
        borderRadius: 50,
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2D3748',
        marginBottom: 10,
    },
    emptyText: {
        fontSize: 16,
        color: '#4A5568',
        textAlign: 'center',
        lineHeight: 24,
    },
});

export default HomeScreen;