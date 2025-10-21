import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  Image,
  PanResponder,
  StatusBar
} from 'react-native';
import LikedScreen from '../screens/LikedScreen';
// import LikedScreen from './LikedScreen'; // Import your actual LikedScreen component

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ExpandableLikedButton = ({ imageMap, styles: parentStyles }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const opacityValue = useRef(new Animated.Value(1)).current;
  const backgroundOpacity = useRef(new Animated.Value(0)).current;

  const buttonRef = useRef(null);
  const [buttonLayout, setButtonLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const measureButton = () => {
    if (buttonRef.current) {
      buttonRef.current.measure((fx, fy, width, height, px, py) => {
        setButtonLayout({ x: px, y: py, width, height });
      });
    }
  };

  const expandButton = () => {
    measureButton();
    setIsExpanded(true);
    
    // Animate the expansion
    Animated.parallel([
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(backgroundOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const collapseButton = () => {
    Animated.parallel([
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(backgroundOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsExpanded(false);
    });
  };

  const animatedStyle = {
    position: 'absolute',
    left: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [buttonLayout.x, 0],
    }),
    top: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [buttonLayout.y, 0],
    }),
    width: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [buttonLayout.width, screenWidth],
    }),
    height: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [buttonLayout.height, screenHeight],
    }),
    borderRadius: animatedValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [10, 20, 0],
    }),
    backgroundColor: 'white',
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  };

  const contentOpacity = animatedValue.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [0, 0, 1],
  });

  const buttonContentOpacity = animatedValue.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [1, 0, 0],
  });

  // Pan responder for swipe down to close
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return gestureState.dy > 10 && gestureState.dx < 50;
    },
    onPanResponderMove: (evt, gestureState) => {
      if (gestureState.dy > 0) {
        const progress = Math.min(gestureState.dy / 200, 1);
        scaleValue.setValue(1 - progress * 0.1);
        opacityValue.setValue(1 - progress * 0.5);
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dy > 100) {
        collapseButton();
      } else {
        Animated.parallel([
          Animated.spring(scaleValue, {
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.spring(opacityValue, {
            toValue: 1,
            useNativeDriver: true,
          }),
        ]).start();
      }
    },
  });

  return (
    <>
      <TouchableOpacity
        ref={buttonRef}
        style={[
          parentStyles.sectionButton,
          { transform: [{ scale: scaleValue }] }
        ]}
        onPress={expandButton}
        activeOpacity={0.8}
      >
        <Image source={imageMap['Liked']} style={{ width: 30, height: 30 }} />
        <Text style={parentStyles.sectionText}>Liked</Text>
      </TouchableOpacity>

      {isExpanded && (
        <>
          {/* Background overlay */}
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: 'rgba(0,0,0,0.3)',
                opacity: backgroundOpacity,
                zIndex: 999,
              },
            ]}
          />

          {/* Expanded container */}
          <Animated.View style={animatedStyle} {...panResponder.panHandlers}>
            {/* Original button content (fades out) */}
            <Animated.View
              style={[
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 10,
                  opacity: buttonContentOpacity,
                },
              ]}
            >
              <Image source={imageMap['Liked']} style={{ width: 30, height: 30 }} />
              <Text style={[parentStyles.sectionText, { marginLeft: 20 }]}>Liked</Text>
            </Animated.View>

            {/* Expanded content (fades in) */}
            <Animated.View
              style={[
                StyleSheet.absoluteFillObject,
                {
                  opacity: contentOpacity,
                  transform: [{ scale: scaleValue }],
                },
              ]}
            >
              {/* Header with close button */}
              <View style={expandedStyles.header}>
                <TouchableOpacity
                  onPress={collapseButton}
                  style={expandedStyles.closeButton}
                >
                  <Text style={expandedStyles.closeButtonText}>×</Text>
                </TouchableOpacity>
                <Text style={expandedStyles.headerTitle}>Liked Items</Text>
                <View style={expandedStyles.placeholder} />
              </View>

              {/* Swipe indicator */}
              <View style={expandedStyles.swipeIndicator}>
                <View style={expandedStyles.swipeBar} />
              </View>

              {/* Your LikedScreen content */}
              <View style={expandedStyles.content}>
                <LikedScreen />
              </View>
            </Animated.View>
          </Animated.View>
        </>
      )}
    </>
  );
};

const expandedStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: StatusBar.currentHeight + 20,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
    fontWeight: 'bold',
  },
  placeholder: {
    width: 30,
  },
  swipeIndicator: {
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  swipeBar: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
  },
});

export default ExpandableLikedButton;