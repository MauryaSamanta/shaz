import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { setlogin } from '../store/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

const OnboardScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  
  // Animation values
  const buttonWidth = useRef(new Animated.Value(screenWidth - 60)).current; // Full width minus padding
  const buttonOpacity = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const loaderOpacity = useRef(new Animated.Value(0)).current;
  const horizontalPadding = useRef(new Animated.Value(28)).current;
  const buttonBackgroundOpacity = useRef(new Animated.Value(1)).current;

  const animateButton = () => {
    // Animate text fade out
    Animated.timing(textOpacity, {
      toValue: 0,
      duration: 50,
      useNativeDriver: false,
    }).start();

    // Animate button width collapse and padding
    Animated.parallel([
      Animated.timing(buttonWidth, {
        toValue: 56, // Just enough for the activity indicator
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.timing(horizontalPadding, {
        toValue: 0, // Remove horizontal padding when collapsed
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.timing(buttonBackgroundOpacity, {
        toValue: 0, // Fade out the black background
        duration: 250,
        useNativeDriver: false,
      })
    ]).start();

    // Animate loader fade in after slight delay
    setTimeout(() => {
      Animated.timing(loaderOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }, 250);
  };

  const resetButton = () => {
    // Reset all animations
    Animated.parallel([
      Animated.timing(buttonWidth, {
        toValue: screenWidth - 60,
        duration: 400,
        useNativeDriver: false,
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(loaderOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(horizontalPadding, {
        toValue: 28,
        duration: 400,
        useNativeDriver: false,
      }),
      Animated.timing(buttonBackgroundOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const quicksignup = async () => {
    setLoading(true);
    animateButton();
    
    try {
      const response = await fetch(`http://192.168.31.12:8000/v1/auth/shadow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const userdata = await response.json();
      const isSuccess = response.status === 201;
      if (!isSuccess) {
        resetButton();
        setLoading(false);
        return;
      }

      console.log(userdata);
      dispatch(setlogin({ user: userdata.user }));

      const completed = await AsyncStorage.getItem('tutorialCompleted');
      if (completed === 'true') {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          })
        );
      } else {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Tutorial' }],
          })
        );
      }
    } catch (error) {
      console.log(error);
      resetButton();
      setLoading(false);
    }
  };

  return (
    <View style={styles.container} 
     >
      <View style={styles.centerContent}>
        <Image source={require('../assets/images/shazlo-logo-v3.png')} style={styles.appName} />
      </View>

      <TouchableOpacity
        style={styles.buttonContainer}
        onPress={quicksignup}
        disabled={loading}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.luxuryBtn,
            {
              width: buttonWidth,
              opacity: buttonOpacity,
              backgroundColor: buttonBackgroundOpacity.interpolate({
                inputRange: [0, 1],
                outputRange: ['transparent', '#1e1e1e'],
              }),
            }
          ]}
        >
          <Animated.View style={[
            styles.luxuryBtnInner,
            { 
              paddingHorizontal: horizontalPadding,
              backgroundColor: buttonBackgroundOpacity.interpolate({
                inputRange: [0, 1],
                outputRange: ['transparent', '#1e1e1e'],
              }),
            }
          ]}>
            <Animated.View style={{ opacity: textOpacity }}>
              <Text style={styles.luxuryBtnText}>Dive in</Text>
            </Animated.View>
            
            <Animated.View
              style={[
                styles.loaderContainer,
                { opacity: loaderOpacity }
              ]}
            >
              <ActivityIndicator size="large" color="#000000" />
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 30,
    paddingTop:100,
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  centerContent: {
    // flex:1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
  width: '120%',
  resizeMode: 'contain',
  aspectRatio: 1, // Keeps proportions (adjust if needed)
},
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  luxuryBtn: {
    borderRadius: 10,
    overflow: 'hidden',
    // backgroundColor moved to animated style
    // elevation: 8,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.25,
    // shadowRadius: 6,
  },
  luxuryBtnInner: {
    paddingVertical: 16,
    // paddingHorizontal will be animated, so removed from here
    // backgroundColor will be animated, so removed from here
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 40,
    position: 'relative',
  },
  luxuryBtnText: {
    color: '#f2f2f2',
    fontSize: 18,
    fontFamily: 'STIXTwoTextBold',
  },
  loaderContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: 'grey',
    textAlign: 'center',
  },
  gradientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    width: '100%',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
    backgroundColor: '#f2f2f2',
  },
  btnText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OnboardScreen;