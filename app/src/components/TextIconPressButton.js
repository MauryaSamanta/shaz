import React, { useRef } from 'react';
import {
  Animated,
  TouchableWithoutFeedback,
  View,
  Image,
  Text,
  StyleSheet,
} from 'react-native';

const TextIconPressButton = ({
  text,
  iconSource,
  onPress,
  size = 18,
  tintColor = 'black',
  textColor = 'black',
  style,
  textStyle,
  spacing = 8,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.88,
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
      <Animated.View
        style={[
          styles.button,
          styles.row,
          style,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Text
          style={[
            styles.text,
            { color: textColor, marginRight: spacing },
            textStyle,
          ]}
        >
          {text}
        </Text>

        <Image
          source={iconSource}
          style={{ width: size, height: size, tintColor }}
        />
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
 button: {
  borderRadius: 12,
  backgroundColor: '#F3F3F5', // 🔥 sexy neutral
  justifyContent: 'center',
  alignItems: 'center',
  paddingVertical: 8,
  paddingHorizontal: 12,
//   marginLeft: -100,
  marginTop: 40,
  width:200
},
  row: {
    flexDirection: 'row',
    // alignItems: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default TextIconPressButton;
