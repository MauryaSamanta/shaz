import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View
} from 'react-native';
// import { useCart } from '../QueryHooks/Cart';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector } from 'react-redux';
// import { useCart } from '../CartUtility/useCart';

const AnimatedTabButton = ({ children, onPress, style }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.65,
      duration: 100,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 150,
      easing: Easing.out(Easing.back(1.2)),
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      style={style}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
        }}
      >
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

const TabBar = ({ activeScreen, handleScreenChange }) => {
  const user = useSelector((state) => state.auth.user);
  // const 
  // const { data: cartItems = [] } = useCart(user?.user_id);
  // const cartItems=useCart()
  const [cartItems, setcartItems] = useState([]);
  const { count: cartcount, isUpdating } = useSelector((state) => state.cart)
  // console.log(cartcount)
  // useEffect(()=>{

  // })
  const badgeScale = useRef(new Animated.Value(0)).current;
  // console.log("TabBar render — cartItems:", cartItems);
  // console.log(user.user_id);
  // console.log(cartItems.length)
  useEffect(() => {
    if (cartcount > 0) {
      Animated.sequence([
        Animated.spring(badgeScale, {
          toValue: 1.3, // expand a little bigger than normal
          friction: 3,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.spring(badgeScale, {
          toValue: 1, // settle back to normal
          friction: 3,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();
    }
    // console.log(cartItems)
  }, [cartcount]);

  return (
    <LinearGradient
      colors={['rgba(255,255,255,1.0)', 'rgba(255,255,255,0.8)', 'rgba(255,255,255,0)']}
      start={{ x: 0.5, y: 1 }}
      end={{ x: 0.5, y: 0 }}
      style={styles.tabContainer}
    >
      <AnimatedTabButton
        style={styles.iconButton}
        onPress={() => {
          handleScreenChange('Home');
          Vibration.vibrate(50);
        }}
      >
        <Image
          source={
            activeScreen === 'Home'
              ? require('../assets/images/home-filled.png')
              : require('../assets/images/home.png')
          }
          style={{ width: 24, height: 24 }}
        />
      </AnimatedTabButton>

      <AnimatedTabButton
        style={styles.iconButton}
        onPress={() => {
          handleScreenChange('Campus');
          Vibration.vibrate(50);
        }}
      >
        <Image
          source={
            activeScreen === 'Campus'
              ? require('../assets/images/bookmark-filled.png')
              : require('../assets/images/save-instagram.png')
          }
          style={{ width: 24, height: 24 }}
        />
      </AnimatedTabButton>

      <AnimatedTabButton
        style={styles.iconButton}
        onPress={() => {
          handleScreenChange('List');
          Vibration.vibrate(50);
        }}
      >
        <Image
          source={
            activeScreen === 'List' || activeScreen === 'Explore'
              ? require('../assets/images/search-filled.png')
              : require('../assets/images/search-tab.png')
          }
          style={{ width: 28, height: 28 }}
        />
      </AnimatedTabButton>

      <AnimatedTabButton
        style={styles.iconButton}
        onPress={() => {
          handleScreenChange('Cart');
          Vibration.vibrate(50);
        }}
      >
        <View>
          <Image
            source={
              activeScreen === 'Cart'
                ? require('../assets/images/shopping-cart-filled.png')
                : require('../assets/images/shopping-cart.png')
            }
            style={{ width: 26, height: 26 }}
          />
          {isUpdating ? (
            <View style={styles.badge}>
              <ActivityIndicator size="small" color="#fff" style={{ transform: [{ scale: 0.6 }] }} />
            </View>
          ) : (
            cartcount > 0 && (
              <Animated.View style={[styles.badge, { transform: [{ scale: badgeScale }] }]}>
                <Text style={styles.badgeText}>{cartcount}</Text>
              </Animated.View>
            )
          )}
        </View>
      </AnimatedTabButton>

      {/* <AnimatedTabButton 
        style={styles.iconButton}
        onPress={() => {
          handleScreenChange('Profile');
          Vibration.vibrate(50);
        }}
      >
        <Image
          source={
            activeScreen === 'Profile'
              ? require('../assets/images/user-filled.png')
              : require('../assets/images/user.png')
          }
          style={{ width: 24, height: 24 }}
        />
      </AnimatedTabButton> */}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    justifyContent: 'space-around',
    alignItems: 'center',
    // borderTopLeftRadius: 30,
    // borderTopRightRadius: 30,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },

  iconButton: {
    padding: 10,
  },
  badge: {
    position: 'absolute',
    right: -2,
    top: -2,
    backgroundColor: 'black',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default TabBar;