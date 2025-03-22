import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Animated,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const CustomAlert = ({ 
  visible, 
  title, 
  message, 
  type = 'success', // 'success', 'error', 'warning', 'info'
  onClose,
  buttons = [{ text: 'OK', onPress: () => {} }]
}) => {
  const [animation] = useState(new Animated.Value(0));
  
  // Définition des couleurs selon le type d'alerte
  const getColors = () => {
    switch(type) {
      case 'success':
        return {
          icon: 'checkmark-circle',
          iconColor: '#10B981',
          gradientColors: ['#D1FAE5', '#A7F3D0'],
          textColor: '#065F46'
        };
      case 'error':
        return {
          icon: 'close-circle',
          iconColor: '#EF4444',
          gradientColors: ['#FEE2E2', '#FECACA'],
          textColor: '#991B1B'
        };
      case 'warning':
        return {
          icon: 'warning',
          iconColor: '#F59E0B',
          gradientColors: ['#FEF3C7', '#FDE68A'],
          textColor: '#92400E'
        };
      case 'info':
      default:
        return {
          icon: 'information-circle',
          iconColor: '#3B82F6',
          gradientColors: ['#DBEAFE', '#BFDBFE'],
          textColor: '#1E40AF'
        };
    }
  };

  const colors = getColors();

  useEffect(() => {
    if (visible) {
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.alertContainer,
            {
              opacity: animation,
              transform: [
                {
                  scale: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={colors.gradientColors}
            style={styles.alertContent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.iconContainer}>
              <Ionicons name={colors.icon} size={40} color={colors.iconColor} />
            </View>
            
            <Text style={[styles.title, { color: colors.textColor }]}>{title}</Text>
            
            {message ? (
              <Text style={[styles.message, { color: colors.textColor }]}>{message}</Text>
            ) : null}
            
            <View style={styles.buttonsContainer}>
              {buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    index === buttons.length - 1 ? styles.primaryButton : styles.secondaryButton,
                  ]}
                  onPress={() => {
                    if (button.onPress) button.onPress();
                    onClose();
                  }}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      index === buttons.length - 1 ? styles.primaryButtonText : styles.secondaryButtonText,
                    ]}
                  >
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    width: width - 60,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  alertContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    width: '100%',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginHorizontal: 6,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
  },
  secondaryButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: 'white',
  },
  secondaryButtonText: {
    color: '#4B5563',
  },
});

export default CustomAlert;
