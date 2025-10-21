import React, { useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  Animated, 
  StyleSheet 
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const ComingSoonModal = ({ visible, onClose }) => {
  const bounceAnim = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      bounceAnim.setValue(0);
    }
  }, [visible]);

  const scale = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  const opacity = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Modal
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.modalContent,
            {
              transform: [{ scale }],
              opacity,
            }
          ]}
        >
          <LinearGradient 
            colors={['#2d2d2d', '#000000']}
            style={styles.gradientBackground}
          >
            <View style={styles.header}>
              <Text style={styles.title}>Hi there! 👋</Text>
              <Text style={styles.subtitle}>
                This is our beta launch — the full experience is coming soon!
              </Text>
            </View>

            <View style={styles.featuresContainer}>
              <View style={styles.featureItem}>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>Checkout from Cart</Text>
                  <Text style={styles.featureDescription}>
                    Seamless checkout experience with multiple payment options
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>Coins & Rewards</Text>
                  <Text style={styles.featureDescription}>
                    Coins you collect now can be redeemed after the official launch!
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>Got it!</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    overflow: 'hidden', // needed for LinearGradient borderRadius
  },
  gradientBackground: {
    padding: 28,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
    textAlign: 'center',
  },
  featuresContainer: {
    marginBottom: 28,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  featureTextContainer: {
    flex: 1,
    paddingTop: 2,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
  },
  closeButton: {
    backgroundColor: 'white', // slightly translucent white button
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    width:'50%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginLeft:'25%'
  },
  closeButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default ComingSoonModal;
