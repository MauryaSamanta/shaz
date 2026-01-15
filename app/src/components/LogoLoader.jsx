import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
const { height, width } = Dimensions.get('window');
const BlinkingShaz = () => {
  const opacity = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <View style={styles.loaderContainer}>
      <Animated.Image style={[styles.blinkingText, { opacity }]} source={require('../assets/images/shazlo-logo-v3.png')}/>
    </View>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    marginTop: 90,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'white',
  },
  blinkingText: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
});


export default BlinkingShaz;
