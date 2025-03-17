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

const HomeScreen = ({ navigation }) => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchBooks = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch('http://192.168.11.102:5000/api/books', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setBooks(data);
        } catch (error) {
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
        try {
            await AsyncStorage.removeItem('token');
            navigation.replace('Login');
        } catch (error) {
            Alert.alert('Erreur', 'Problème lors de la déconnexion');
        }
    };

    const handleDeleteBook = async (bookId) => {
        Alert.alert(
            'Confirmation',
            'Voulez-vous vraiment supprimer ce livre ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem('token');
                            const response = await fetch(`http://192.168.11.102:5000/api/books/${bookId}`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                }
                            });
                            
                            if (response.ok) {
                                fetchBooks();
                                Alert.alert('Succès', 'Livre supprimé avec succès');
                            } else {
                                Alert.alert('Erreur', 'Impossible de supprimer le livre');
                            }
                        } catch (error) {
                            Alert.alert('Erreur', 'Une erreur est survenue');
                        }
                    }
                }
            ]
        );
    };

    const renderBookItem = ({ item }) => (
        <View style={styles.bookCard}>
          <Image
            source={{ uri: item.imageUrl ? `http://192.168.11.102:5000/${item.imageUrl}` : 'https://via.placeholder.com/150' }}
            style={styles.bookImage}
            resizeMode="cover"
          />
            <View style={styles.bookInfo}>
                <Text style={styles.bookTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.bookAuthor} numberOfLines={1}>{item.author}</Text>
                <Text style={styles.bookDescription} numberOfLines={2}>{item.description}</Text>
                
                <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                        style={[styles.button, styles.editButton]}
                        onPress={() => navigation.navigate('EditBook', { book: item })}
                    >
                        <Ionicons name="create-outline" size={20} color="white" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.button, styles.deleteButton]}
                        onPress={() => handleDeleteBook(item.id)}
                    >
                        <Ionicons name="trash-outline" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <StatusBar backgroundColor="#1A365D" barStyle="light-content" />
                <ActivityIndicator size="large" color="#1A365D" />
                <Text style={styles.loadingText}>Chargement de votre bibliothèque...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#1A365D" barStyle="light-content" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Bibliothèque</Text>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Ionicons name="log-out-outline" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={books}
                renderItem={renderBookItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.bookList}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => {
                            setRefreshing(true);
                            fetchBooks();
                        }}
                        colors={["#1A365D"]}
                    />
                }
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="book-outline" size={60} color="#A0AEC0" />
                        <Text style={styles.emptyText}>Aucun livre disponible</Text>
                    </View>
                )}
                showsVerticalScrollIndicator={false}
            />

            <TouchableOpacity 
                style={styles.addButton}
                onPress={() => navigation.navigate('AddBook')}
            >
                <Ionicons name="add" size={30} color="white" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#1A365D',
        fontWeight: '500',
    },
    header: {
        backgroundColor: '#1A365D',
        paddingTop: 16,
        paddingBottom: 16,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    headerTitle: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    logoutButton: {
        padding: 8,
    },
    bookList: {
        padding: 16,
        paddingBottom: 80,
    },
    bookCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 16,
        flexDirection: 'row',
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        borderColor: '#E2E8F0',
        borderWidth: 1,
    },
    bookImage: {
        width: 110,
        height: 160,
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
    },
    bookInfo: {
        flex: 1,
        padding: 16,
        justifyContent: 'space-between',
    },
    bookTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 6,
        color: '#1A365D',
    },
    bookAuthor: {
        fontSize: 14,
        color: '#4A5568',
        marginBottom: 10,
        fontWeight: '500',
    },
    bookDescription: {
        fontSize: 14,
        color: '#718096',
        marginBottom: 14,
        lineHeight: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    button: {
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
    editButton: {
        backgroundColor: '#38A169',
    },
    deleteButton: {
        backgroundColor: '#E53E3E',
    },
    addButton: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#1A365D',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 40,
        height: 300,
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#4A5568',
        fontWeight: '500',
        textAlign: 'center',
        marginTop: 16,
    },
});

export default HomeScreen;