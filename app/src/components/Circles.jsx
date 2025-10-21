import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';

const { width } = Dimensions.get('window');

const CarouselCircleIndicator = ({
  data = [],
  activeIndex = 0,
  onCirclePress,
  circleSize = 8,
  activeCircleSize = 10,
  circleColor = '#C4C4C4',
  activeCircleColor = '#0b906cff',
  spacing = 2,
  animationDuration = 300,
  
  style,
}) => {
  const animatedValues = useRef(
    data.map(() => new Animated.Value(0))
  ).current;

  const scaleValues = useRef(
    data.map(() => new Animated.Value(1))
  ).current;

  useEffect(() => {
    // Animate all circles
    data.forEach((_, index) => {
      const isActive = index === activeIndex;
      
      // Opacity animation
      Animated.timing(animatedValues[index], {
        toValue: isActive ? 1 : 0,
        duration: animationDuration,
        useNativeDriver: true,
      }).start();

      // Scale animation
      Animated.timing(scaleValues[index], {
        toValue: isActive ? activeCircleSize / circleSize : 1,
        duration: animationDuration,
        useNativeDriver: true,
      }).start();
    });
  }, [activeIndex, animationDuration]);

  const handleCirclePress = (index) => {
    if (onCirclePress) {
      onCirclePress(index);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {data.map((_, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => handleCirclePress(index)}
          activeOpacity={0.7}
          style={[
            styles.circleContainer,
            { marginHorizontal: spacing / 2 }
          ]}
        >
          {/* Inactive Circle (Base) */}
          <View
            style={[
              styles.circle,
              {
                width: circleSize,
                height: circleSize,
                borderRadius: circleSize / 2,
                backgroundColor: circleColor,
              },
            ]}
          />
          
          {/* Active Circle (Animated) */}
          <Animated.View
            style={[
              styles.activeCircle,
              {
                width: circleSize,
                height: circleSize,
                borderRadius: circleSize / 2,
                backgroundColor: activeCircleColor,
                opacity: animatedValues[index],
                transform: [{ scale: scaleValues[index] }],
              },
            ]}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',   
    paddingVertical: 0,
    overflow:'visible'
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    position: 'absolute',
  },
  activeCircle: {
    position: 'absolute',
  },
});


export default CarouselCircleIndicator;