import React, { useRef } from 'react';
import { Animated, TouchableOpacity, Image, View } from 'react-native';

export default function HeartButton({ navigation }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    // Animate the heart growing big
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 15, // grows large enough to fill the screen
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Navigate after animation
      navigation.navigate('Liked');
      // Reset scale for when you come back
      scaleAnim.setValue(1);
    });
  };

  return (
    <View style={{ position: 'absolute', top: 5, left: 120 }}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity activeOpacity={0.8} onPress={handlePress}>
          <Image
            source={require('../assets/images/heart.png')}
            style={{ width: 30, height: 30 }}
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
