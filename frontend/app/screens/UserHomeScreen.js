import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    StatusBar,
    TextInput,
    Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import CustomAlert from './CustomAlert'; // Importez le composant CustomAlert

const UserHomeScreen = ({ navigation }) => {
    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Ajout de l'état pour CustomAlert
    const [alert, setAlert] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'success',
        buttons: []
    });

    const fetchBooks = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                navigation.replace('Login');
                return;
            }
            
            const response = await fetch('http://192.168.1.172:5000/api/books', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Erreur de serveur');
            }
            
            const data = await response.json();
            console.log('Livres récupérés:', data);

            // Transformer les URLs d'image
            const booksWithImages = data.map(book => ({
                ...book,
                imageUrl: book.image_url 
                    ? `http://192.168.1.172:5000/${book.image_url.replace(/\\/g, "/")}`
                    : 'https://via.placeholder.com/150'
            }));

            setBooks(booksWithImages);
            setFilteredBooks(booksWithImages);
        } catch (error) {
            console.error('Erreur:', error);
            // Utilisation de CustomAlert au lieu de Alert.alert
            setAlert({
                visible: true,
                title: 'Erreur',
                message: 'Impossible de charger les livres',
                type: 'error',
                buttons: [{ text: 'OK', onPress: () => {} }]
            });
        } finally {
            setLoading(false);
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

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredBooks(books);
        } else {
            const filtered = books.filter(book => 
                book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                book.author.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredBooks(filtered);
        }
    }, [searchQuery, books]);

    const renderBookItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.bookCard}
            onPress={() => navigation.navigate('DetailsUser', { bookId: item.id })}
            activeOpacity={0.7}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: item.imageUrl }}
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
            </LinearGradient>

            {/* Barre de recherche */}
            <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={20} color="#A0AEC0" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Rechercher un livre..."
                    placeholderTextColor="#A0AEC0"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                        <Ionicons name="close-circle" size={20} color="#A0AEC0" />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.container}>
                <FlatList
                    data={filteredBooks}
                    renderItem={renderBookItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.bookList}
                    numColumns={2}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyContainer}>
                            {searchQuery.length > 0 ? (
                                <>
                                    <View style={styles.emptyIconContainer}>
                                        <Ionicons name="search-outline" size={60} color="#A0AEC0" />
                                    </View>
                                    <Text style={styles.emptyTitle}>Aucun résultat trouvé</Text>
                                    <Text style={styles.emptyText}>
                                        Aucun livre ne correspond à votre recherche. Essayez avec d'autres termes.
                                    </Text>
                                </>
                            ) : (
                                <>
                                    <View style={styles.emptyIconContainer}>
                                        <Ionicons name="book-outline" size={60} color="#A0AEC0" />
                                    </View>
                                    <Text style={styles.emptyTitle}>Aucun livre disponible</Text>
                                    <Text style={styles.emptyText}>
                                        Aucun livre n'est disponible dans la bibliothèque pour le moment.
                                    </Text>
                                </>
                            )}
                        </View>
                    )}
                    showsVerticalScrollIndicator={false}
                />
            </View>
            
            {/* Ajout du composant CustomAlert */}
            <CustomAlert
                visible={alert.visible}
                title={alert.title}
                message={alert.message}
                type={alert.type}
                buttons={alert.buttons}
                onClose={() => setAlert(prev => ({ ...prev, visible: false }))}
            />
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        marginHorizontal: 15,
        marginTop: 15,
        marginBottom: 5,
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#2D3748',
    },
    clearButton: {
        padding: 5,
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

export default UserHomeScreen;