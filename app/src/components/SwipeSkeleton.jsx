import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');

const SwipeSkeleton = () => {
  const shimmerAnim = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-width, width],
  });

  return (
    <View style={styles.wrapper}>
      {/* Filter Bar Skeleton */}
      {/* <View style={styles.filterBar}>
        
        <View style={styles.filterBtn} />
        <View style={styles.filterBtn} />
        <View style={styles.filterBtn} />
      </View> */}

      {/* Card Skeleton */}
      <View style={styles.card}>
        <Animated.View
          style={[
            styles.shimmerOverlay,
            { transform: [{ translateX }] }
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
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  filterIcon: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    marginRight: 14,
  },
  filterBtn: {
    width: 70,
    height: 30,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    marginRight: 10,
  },
  card: {
    width: width * 0.92,
    height: height * 0.74,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    overflow: 'hidden',
    alignSelf: 'center',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: width,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
});
