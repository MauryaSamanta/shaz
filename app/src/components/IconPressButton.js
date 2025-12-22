import React, { useRef } from 'react';
import { Animated, TouchableWithoutFeedback, View, Image, StyleSheet } from 'react-native';

const IconPressButton = ({ iconSource, onPress, size = 20, tintColor = 'black', style }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.8, // 🔥 more visible press-in (was 0.5 — too small)
      friction: 6,
      tension: 150,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 120,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Animated.View style={[styles.button, style, { transform: [{ scale: scaleAnim }] }]}>
        <Image source={iconSource} style={{ width: size, height: size, tintColor }} />
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default IconPressButton;
