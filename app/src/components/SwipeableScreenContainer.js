import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import TabBar from './TabBar'; // Your existing TabBar component

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25; // 25% of screen width to trigger screen change

const SwipeableScreenContainer = ({ 
  screens, // Array of screen names: ['Home', 'Campus', 'List', 'Cart']
  renderScreen, // Function that takes screen name and returns the component
  initialScreen = 'Home'
}) => {
  const screenOrder = screens; // ['Home', 'Campus', 'List', 'Cart']
  const [activeScreenIndex, setActiveScreenIndex] = useState(
    screenOrder.indexOf(initialScreen)
  );
  
  const translateX = useRef(new Animated.Value(0)).current;
  const lastOffset = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to horizontal swipes
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
      },
      
      onPanResponderMove: (_, gestureState) => {
        const newValue = lastOffset.current + gestureState.dx;
        
        // Add resistance at edges
        const isAtLeftEdge = activeScreenIndex === 0 && gestureState.dx > 0;
        const isAtRightEdge = activeScreenIndex === screenOrder.length - 1 && gestureState.dx < 0;
        
        if (isAtLeftEdge || isAtRightEdge) {
          // Apply resistance effect
          translateX.setValue(newValue * 0.3);
        } else {
          translateX.setValue(newValue);
        }
      },
      
      onPanResponderRelease: (_, gestureState) => {
        const shouldChangeScreen = Math.abs(gestureState.dx) > SWIPE_THRESHOLD;
        const direction = gestureState.dx > 0 ? -1 : 1; // Swipe right = go left in screen order
        
        let newIndex = activeScreenIndex;
        
        if (shouldChangeScreen) {
          newIndex = activeScreenIndex + direction;
          newIndex = Math.max(0, Math.min(screenOrder.length - 1, newIndex));
        }
        
        // Animate to the target position
        const targetOffset = -newIndex * SCREEN_WIDTH;
        lastOffset.current = targetOffset;
        
        Animated.spring(translateX, {
          toValue: targetOffset,
          useNativeDriver: true,
          tension: 65,
          friction: 10,
        }).start();
        
        if (newIndex !== activeScreenIndex) {
          setActiveScreenIndex(newIndex);
        }
      },
    })
  ).current;

  const handleScreenChange = (screenName) => {
    const newIndex = screenOrder.indexOf(screenName);
    if (newIndex === -1 || newIndex === activeScreenIndex) return;
    
    setActiveScreenIndex(newIndex);
    const targetOffset = -newIndex * SCREEN_WIDTH;
    lastOffset.current = targetOffset;
    
    Animated.spring(translateX, {
      toValue: targetOffset,
      useNativeDriver: true,
      tension: 65,
      friction: 10,
    }).start();
  };

  return (
    <View style={styles.container}>
      <View style={styles.screenContainer} {...panResponder.panHandlers}>
        <Animated.View
          style={[
            styles.screensWrapper,
            {
              width: SCREEN_WIDTH * screenOrder.length,
              transform: [{ translateX }],
            },
          ]}
        >
          {screenOrder.map((screenName, index) => (
            <View key={screenName} style={styles.screen}>
              {renderScreen(screenName, index === activeScreenIndex)}
            </View>
          ))}
        </Animated.View>
      </View>
      
      <TabBar
        activeScreen={screenOrder[activeScreenIndex]}
        handleScreenChange={handleScreenChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  screenContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  screensWrapper: {
    flexDirection: 'row',
    height: '100%',
  },
  screen: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
});

export default SwipeableScreenContainer;