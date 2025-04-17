import { StyleSheet } from "react-native";
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
        alignItems: 'center',
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
    },
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 5,
        padding: 20,
        marginBottom: 20,
    },
    form: {
        gap: 16,
    },
    inputGroup: {
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        marginBottom: 8,
        color: '#4A5568',
        fontWeight: '600',
    },
    required: {
        color: '#E53E3E',
        fontWeight: '500',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7FAFC',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    inputIcon: {
        padding: 10,
    },
    input: {
        flex: 1,
        padding: 12,
        fontSize: 15,
        color: '#2D3748',
    },
    textAreaContainer: {
        alignItems: 'flex-start',
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    divider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginVertical: 10,
    },
    uploadSection: {
        gap: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2D3748',
        marginBottom: 10,
    },
    uploadGroup: {
        marginBottom: 16,
    },
    uploadButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    uploadGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
    },
    uploadButtonText: {
        color: 'white',
        fontSize: 16,
        marginLeft: 8,
        fontWeight: '600',
    },
    previewContainer: {
        position: 'relative',
        marginTop: 8,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    imagePreview: {
        width: '100%',
        height: 200,
        borderRadius: 12,
    },
    removeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 15,
        padding: 2,
    },
    pdfPreview: {
        flexDirection: 'row',
        backgroundColor: '#FFF5F5',
        padding: 12,
        borderRadius: 12,
        marginTop: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FED7D7',
    },
    pdfIconContainer: {
        backgroundColor: 'rgba(229, 62, 62, 0.1)',
        padding: 8,
        borderRadius: 8,
    },
    pdfName: {
        flex: 1,
        marginLeft: 12,
        color: '#4A5568',
        fontSize: 14,
        fontWeight: '500',
    },
    removePdfButton: {
        padding: 4,
    },
    submitButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 10,
    },
    disabledButton: {
        opacity: 0.7,
    },
    submitGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    submitIcon: {
        marginRight: 8,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
