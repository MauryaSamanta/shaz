import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet, Easing } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';

export default function DynamicIsland() {
  const scaleX = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    const checkAndRun = async () => {
      const hasShown = await AsyncStorage.getItem('hasShownDynamicIsland');
      if (!hasShown) {
        setShouldAnimate(true);
        await AsyncStorage.setItem('hasShownDynamicIsland', 'true');
      }
    };
    checkAndRun();
  }, []);

  useEffect(() => {
    if (!shouldAnimate) return;

    const delayTimer = setTimeout(() => {
      Animated.sequence([
        // Expand from center
        Animated.timing(scaleX, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        // Fade in text
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Wait 3 seconds then shrink back
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(scaleX, {
              toValue: 0,
              duration: 500,
              easing: Easing.in(Easing.exp),
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0,
              duration: 300,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
          ]).start();
        }, 3000);
      });
    }, 3000);

    return () => clearTimeout(delayTimer);
  }, [shouldAnimate]);

  if (!shouldAnimate) return null;

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ scaleX }],
          },
        ]}
      >
        <LinearGradient
          colors={['#000000', '#1a1a1a', '#000000']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Animated.Text style={[styles.text, { opacity: opacityAnim }]}>
          Welcome Back
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: 200,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(255, 255, 255, 0.15)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
});
