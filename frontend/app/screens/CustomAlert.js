import React, { useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
    Animated,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CustomAlert = ({ visible, title, message, type = 'success', buttons = [], onClose }) => {
    const slideAnim = new Animated.Value(0);
    const fadeAnim = new Animated.Value(0);

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true
                })
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true
                })
            ]).start();
        }
    }, [visible]);

    // Determine icon and colors based on alert type
    let iconName, backgroundColor, iconColor;
    switch (type) {
        case 'success':
            iconName = 'checkmark-circle';
            backgroundColor = '#10B981';
            iconColor = '#ECFDF5';
            break;
        case 'error':
            iconName = 'close-circle';
            backgroundColor = '#EF4444';
            iconColor = '#FEF2F2';
            break;
        case 'warning':
            iconName = 'warning';
            backgroundColor = '#F59E0B';
            iconColor = '#FFFBEB';
            break;
        default:
            iconName = 'information-circle';
            backgroundColor = '#3B82F6';
            iconColor = '#EFF6FF';
    }

    const slideInterpolate = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [Dimensions.get('window').height, 0]
    });

    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="none"
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <Animated.View
                    style={[
                        styles.modalOverlay,
                        { opacity: fadeAnim }
                    ]}
                >
                    <TouchableOpacity
                        style={{ flex: 1 }}
                        activeOpacity={1}
                        onPress={onClose}
                    />
                </Animated.View>

                <Animated.View
                    style={[
                        styles.modalView,
                        {
                            transform: [{ translateY: slideInterpolate }]
                        }
                    ]}
                >
                    <View style={[styles.iconContainer, { backgroundColor }]}>
                        <Ionicons name={iconName} size={30} color={iconColor} />
                    </View>

                    <Text style={styles.modalTitle}>{title}</Text>
                    <Text style={styles.modalMessage}>{message}</Text>

                    <View style={styles.buttonContainer}>
                        {buttons.length > 0 ? (
                            buttons.map((button, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.button,
                                        index === 0 ? { backgroundColor } : styles.secondaryButton,
                                        index > 0 && { marginTop: 10 }
                                    ]}
                                    onPress={() => {
                                        if (button.onPress) button.onPress();
                                        onClose();
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.buttonText,
                                            index !== 0 && styles.secondaryButtonText
                                        ]}
                                    >
                                        {button.text}
                                    </Text>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor }]}
                                onPress={onClose}
                            >
                                <Text style={styles.buttonText}>OK</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        width: '85%',
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    modalTitle: {
        marginBottom: 10,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    modalMessage: {
        marginBottom: 20,
        textAlign: 'center',
        fontSize: 15,
        color: '#4B5563',
        lineHeight: 22,
    },
    buttonContainer: {
        width: '100%',
    },
    button: {
        borderRadius: 10,
        padding: 12,
        elevation: 2,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    secondaryButton: {
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    secondaryButtonText: {
        color: '#4B5563',
    }
});

export default CustomAlert;