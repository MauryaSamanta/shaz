import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing } from 'react-native';

const ColorSelector = ({ colors, selectedColor, selectedSize, selectvariant }) => {
  const [isOpen, setIsOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    Animated.timing(animation, {
      toValue: isOpen ? 0 : 1,
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  };

  const heightInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, colors.length * 36],
  });

  const rotateInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={{ marginTop: 10, marginLeft: 140 }}>
      {/* Selected Color Box */}
      <TouchableOpacity
        onPress={toggleDropdown}
        activeOpacity={0.8}
        style={{
          display:'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#222',
          paddingHorizontal: 4,
          paddingVertical: 4,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: '#444',
          alignSelf: 'flex-start', // makes it small
        }}
      >
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: selectedColor?.toLowerCase() || colors[0].toLowerCase(),
            borderWidth: 1,
            borderColor: '#fff',
            marginRight: 6,
          }}
        />

        <Animated.Text
          style={{
            color: 'white',
            fontSize: 12,
            transform: [{ rotate: rotateInterpolate }],
          }}
        >
          ▼
        </Animated.Text>
      </TouchableOpacity>

      {/* Animated Dropdown */}
      <Animated.View
        style={{
          overflow: 'hidden',
          height: heightInterpolate,
          backgroundColor: '#111',
          borderRadius: 6,
          marginTop: 4,
          borderWidth: isOpen ? 1 : 0,
          borderColor: '#333',
          paddingVertical: isOpen ? 6 : 0,
          alignSelf: 'flex-start', // keeps it narrow
        }}
      >
        <View style={{ alignItems: 'center', paddingHorizontal: 6 }}>
          {colors.map((color) => (
            <TouchableOpacity
              key={color}
              onPress={() => {
                selectvariant(selectedSize, color);
                setIsOpen(false);
                Animated.timing(animation, {
                  toValue: 0,
                  duration: 200,
                  easing: Easing.ease,
                  useNativeDriver: false,
                }).start();
              }}
              activeOpacity={0.8}
              style={{
                width: 26,
                height: 26,
                borderRadius: 13,
                backgroundColor: color.toLowerCase(),
                borderWidth: selectedColor === color ? 2 : 1,
                borderColor: selectedColor === color ? '#fff' : '#555',
                marginVertical: 4,
              }}
            />
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

export default ColorSelector;
