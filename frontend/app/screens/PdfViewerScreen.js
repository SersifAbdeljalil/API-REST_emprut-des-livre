// PdfViewerScreen.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const PdfViewerScreen = ({ route }) => {
    const { pdfUri } = route.params;

    return (
        <View style={styles.container}>
            <WebView 
                originWhitelist={['*']}
                source={{ uri: pdfUri }} 
                style={{ flex: 1 }} 
                javaScriptEnabled={true} 
                domStorageEnabled={true} 
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default PdfViewerScreen;