import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  StatusBar,
  Dimensions,
  ImageBackground,
  Animated,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart } from '../QueryHooks/Cart';
import { setCartCount } from '../store/cartSlice';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Subscribe to network state
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected && state.isInternetReachable;
      setIsConnected(connected);

      if (!connected) {
        // Animate in the error box
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      } else {
        // Animate out if connection is restored
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start();

        // ✅ Only navigate if connected
        // Replace with your actual navigation logic
        // Example: navigation.replace('Home');
      }
    });

    return () => unsubscribe();
  }, []);
  const user=useSelector((state)=>state.auth.user);
  const dispatch=useDispatch();
useEffect(() => {
  const loadCart = async () => {
    if (!user) return;

    try {
      const cartItems = await fetchCart(user.user_id); // fetch cart items from API
      console.log(cartItems)
      dispatch(setCartCount(cartItems.length)); // set initial cart count in Redux
    } catch (err) {
      console.log('Error fetching cart:', err);
    }
  };

  loadCart();
}, [user]);

  return (
    <ImageBackground
      source={require('../assets/images/background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      {/* Overlay */}
      <View style={styles.overlay} />

      <StatusBar barStyle="light-content" backgroundColor="transparent" />

      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/shazlo-logo-v3.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

       

        <View style={styles.footer}>
          <Text style={styles.version}>Version 2.2.1</Text>
        </View>
      </View>

      {/* Fancy network error box at bottom */}
      <Animated.View
        style={[
          styles.networkErrorBox,
          { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0], // slide up effect
          }) }] },
        ]}
      >
        <Text style={styles.networkErrorText}>
          Uh oh! Seems like a network issue.
        </Text>
      </Animated.View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
    width:'100%'
  },
  logoImage: {
  width: '350%',   // ✅ use % instead of px
  height: undefined, // ✅ allow automatic height scaling
  aspectRatio: 8, // ✅ adjust this to match your logo’s proportions
},
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  tagline: {
    fontSize: 26,
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'STIXTwoTextRegular',
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  version: {
    fontSize: 14,
    color: '#eee',
    opacity: 0.8,
  },
  // Fancy bottom error box
  networkErrorBox: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 77, 77, 0.95)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5, // for android shadow
    shadowColor: '#000', // for iOS shadow
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  networkErrorText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default SplashScreen;
