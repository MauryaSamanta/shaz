import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View, Easing } from 'react-native';

const { width, height } = Dimensions.get('window');

const SwipeSkeleton = () => {
  const shimmerAnim = useRef(new Animated.Value(-1)).current;
  const shimmerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start shimmer movement
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1400,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    ).start();

    // Fade in shimmer only (not the card itself)
    Animated.timing(shimmerOpacity, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-width, width],
  });

  const rotateZ = shimmerAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-15deg', '15deg'], // subtle diagonal
  });

  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        {/* shimmer layers fade in, card stays solid */}
        <Animated.View
          style={[
            styles.shimmerOverlay,
            {
              opacity: shimmerOpacity,
              transform: [{ translateX }, { rotateZ }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.shimmerOverlay,
            {
              opacity: shimmerOpacity.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.25],
              }),
              transform: [
                {
                  translateX: translateX.interpolate({
                    inputRange: [-width, width],
                    outputRange: [-width * 1.3, width * 1.3],
                  }),
                },
              ],
            },
          ]}
        />
      </View>
    </View>
  );
};

export default SwipeSkeleton;

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: width * 0.92,
    height: height * 0.77,
    borderRadius: 18,
    backgroundColor: '#e0e0e0',
    overflow: 'hidden',
    alignSelf: 'center',

    // fashion depth, soft luxe shadow
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: width * 1.5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
  },
});
