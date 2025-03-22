import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';

const PDFViewerScreen = ({ route, navigation }) => {
    const { pdfUrl, bookTitle, bookId } = route.params;
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [localPdfUrl, setLocalPdfUrl] = useState(null);

    useEffect(() => {
        preparePdf();
    }, []);

    const preparePdf = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            const token = await AsyncStorage.getItem('token');

            // Log the book ID to help with debugging
            console.log("Tentative de téléchargement du PDF pour le livre ID:", bookId);

            // Construire l'URL complète
            let fullUrl = pdfUrl;
            if (!fullUrl) {
                // Utiliser l'endpoint correct qui existe sur le backend
                fullUrl = `http://192.168.1.4:5000/api/books/${bookId}/download-pdf`;
            }
            
            if (token && !fullUrl.includes('token=')) {
                fullUrl = fullUrl.includes('?') 
                    ? `${fullUrl}&token=${token}` 
                    : `${fullUrl}?token=${token}`;
            }

            console.log("URL du PDF à télécharger:", fullUrl);

            // Créer un nom de fichier unique pour ce PDF
            const fileName = `book_${bookId}_${Date.now()}.pdf`;
            const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

            // Télécharger le PDF dans un fichier local temporaire
            const downloadResult = await FileSystem.downloadAsync(
                fullUrl,
                fileUri,
                {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : '',
                    }
                }
            );

            console.log("Téléchargement terminé:", downloadResult);

            // Vérification explicite du statut de réponse
            if (downloadResult.status !== 200) {
                throw new Error(`Erreur de téléchargement: ${downloadResult.status}`);
            }
            
            setLocalPdfUrl(downloadResult.uri);
            setIsLoading(false);
        } catch (error) {
            console.error("Erreur lors de la préparation du PDF:", error);
            setError(`Impossible de charger le document: ${error.message}`);
            setIsLoading(false);
        }
    };

    // HTML personnalisé pour afficher le PDF dans WebView
    const generatePdfHtml = (pdfUri) => {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <style>
                body, html {
                    margin: 0;
                    padding: 0;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                }
                iframe {
                    border: none;
                    width: 100%;
                    height: 100%;
                }
            </style>
        </head>
        <body>
            <iframe src="${pdfUri}" type="application/pdf" width="100%" height="100%"></iframe>
        </body>
        </html>
        `;
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            {/* En-tête avec titre */}
            <LinearGradient
                colors={['#3a416f', '#141727']}
                style={styles.headerGradient}
            >
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{bookTitle}</Text>
            </LinearGradient>
            
            {/* Contenu */}
            <View style={styles.contentContainer}>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#4F6CE1" />
                        <Text style={styles.loadingText}>Chargement du document...</Text>
                    </View>
                ) : error ? (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle-outline" size={60} color="#EF4444" />
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity 
                            style={styles.retryButton}
                            onPress={preparePdf}
                        >
                            <LinearGradient
                                colors={['#4F6CE1', '#7D55F3']}
                                style={styles.retryButtonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Ionicons name="refresh-outline" size={20} color="white" />
                                <Text style={styles.retryButtonText}>Réessayer</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <WebView
                        originWhitelist={['*']}
                        source={{ 
                            html: generatePdfHtml(localPdfUrl),
                            baseUrl: '' 
                        }}
                        style={styles.webView}
                        onError={(syntheticEvent) => {
                            const { nativeEvent } = syntheticEvent;
                            console.error('WebView error:', nativeEvent);
                            setError(`Erreur d'affichage: ${nativeEvent.description}`);
                        }}
                        onHttpError={(syntheticEvent) => {
                            const { nativeEvent } = syntheticEvent;
                            console.error('WebView HTTP error:', nativeEvent);
                            setError(`Erreur HTTP: ${nativeEvent.statusCode}`);
                        }}
                        renderLoading={() => (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#4F6CE1" />
                                <Text style={styles.loadingText}>Préparation de l'affichage...</Text>
                            </View>
                        )}
                        startInLoadingState={true}
                    />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    headerGradient: {
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: 'white',
        flex: 1,
    },
    contentContainer: {
        flex: 1,
    },
    webView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        color: '#4F6CE1',
        fontWeight: '500',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        marginTop: 15,
        fontSize: 16,
        color: '#4B5563',
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        width: 200,
        borderRadius: 8,
        overflow: 'hidden',
    },
    retryButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});

export default PDFViewerScreen;