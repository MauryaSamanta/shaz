import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useTutorial } from './TutorialManager';

const { width, height } = Dimensions.get('window');

const TutorialOverlay = ({ children }) => {
  const { tutorialActive, currentStep, tutorialType, nextStep, endTutorial, setCurrentStep } = useTutorial();
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const spotlightScale = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (tutorialActive) {
      // Animate overlay appearance
      Animated.sequence([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(spotlightScale, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations
      overlayOpacity.setValue(0);
      spotlightScale.setValue(0);
      contentOpacity.setValue(0);
    }
  }, [tutorialActive]);

  const getStepConfig = () => {
    if (tutorialType === 'swipe') {
      return swipeSteps[currentStep] || {};
    } else if (tutorialType === 'navigation') {
      return navigationSteps[currentStep] || {};
    }
    return {};
  };

  const stepConfig = getStepConfig();

  if (!tutorialActive) return children;

  return (
    <View style={styles.container}>
      {children}

      {/* Dark Overlay */}
      <Animated.View
        style={[
          styles.overlay,
          { opacity: overlayOpacity }
        ]}
      >
        <TouchableWithoutFeedback onPress={() => { }}>
          <View style={styles.overlayContent}>

            {/* Spotlight Effect */}
           {stepConfig.spotlight && (
  <>
    {/* Top Overlay */}
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: stepConfig.spotlight.y,
        backgroundColor: 'rgba(0, 0, 0, 0.67)',
      }}
    />

    {/* Bottom Overlay */}
    <View
      style={{
        position: 'absolute',
        top: stepConfig.spotlight.bt,
        left: 0,
        right: 0,
        bottom: 0,
        height:stepConfig.spotlight.bh,
        backgroundColor: 'rgba(0, 0, 0, 0.67)',
      }}
    />

    {/* Left Overlay */}
    <View
      style={{
        position: 'absolute',
        top: stepConfig.spotlight.y,
        left: stepConfig.spotlight.right,
        width: stepConfig.spotlight.x,
        height: stepConfig.spotlight.height,
        backgroundColor: 'rgba(0, 0, 0, 0.67)',
      }}
    />

    {/* Right Overlay */}
    <View
      style={{
        position: 'absolute',
        top: stepConfig.spotlight.y,
        left: stepConfig.spotlight.left,
        right: 0,
        height: stepConfig.spotlight.height,
        backgroundColor: 'rgba(0, 0, 0, 0.67)',
      }}
    />
  </>
)}


            {/* Tutorial Content */}
            <Animated.View
              style={[
                styles.tutorialContent,
                { opacity: contentOpacity },
                stepConfig.contentPosition || styles.defaultContentPosition
              ]}
            >
              {stepConfig.title&&(<Text style={styles.tutorialTitle}>
                {stepConfig.title}
              </Text>)}
              {stepConfig.img&&(<Image source={stepConfig.img}  style={{ width: '100%', height: 80, resizeMode: 'contain', marginBottom:30 }}/>)}
              <Text style={styles.tutorialDescription}>
                {stepConfig.description}
              </Text>

              {/* Gesture Animations */}
              {stepConfig.showGesture && (
                <SwipeAnimation direction={stepConfig.gestureDirection} />
              )}

              {/* Navigation Buttons */}
              <View style={styles.buttonContainer}>
                {currentStep > 0 && (
                  <TouchableOpacity
                    style={[styles.button, styles.secondaryButton]}
                    onPress={() => setCurrentStep(currentStep - 1)}
                  >
                    <Text style={styles.secondaryButtonText}>Back</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.button, styles.primaryButton]}
                  onPress={stepConfig.isLast ? endTutorial : nextStep}
                >
                  <Text style={styles.primaryButtonText}>
                    {stepConfig.isLast ? 'Got it!' : 'Next'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

          </View>
        </TouchableWithoutFeedback>
      </Animated.View>
    </View>
  );
};

// SwipeAnimation.js - Animated gesture demonstrations
const SwipeAnimation = ({ direction }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        animatedValue.setValue(0);
        animate(); // Loop animation
      });
    };

    animate();
  }, [direction]);

  const getTransform = () => {
    switch (direction) {
      case 'right':
        return [{
          translateX: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 100],
          })
        }];
      case 'left':
        return [{
          translateX: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -100],
          })
        }];
      case 'up':
        return [{
          translateY: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -100],
          })
        }];
      case 'down':
        return [{
          translateY: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 100],
          })
        }];
      default:
        return [];
    }
  };

  return (
    <Animated.View
      style={[
        styles.gestureAnimation,
        {
          opacity,
          transform: getTransform(),
        },
      ]}
    >
      <View style={styles.fingerPointer} />
      <View style={styles.gestureTrail} />
    </Animated.View>
  );
};

// Tutorial Step Configurations
const swipeSteps = [
  {
    // title: "",
    description: "Swipe through fashion items to discover your perfect style. Let's learn how it works!",
    img:require("../assets/images/main-logo-light.png"),
    spotlight: {
      x: width*0.02,
      y: height * 0.156,
      radius: Math.min(width, height) * 0.4,
      left:380,
      right:0,
      height:800,
      bh:70,
      bt:720
    },
    contentPosition: {
      position: 'absolute',
      bottom: 100,
      left: 20,
      right: 20,
    },
  },
  {
    title: "Swipe Right to Like ❤️",
    description: "Found something you love? Swipe right to add it to your preferences!",
    spotlight: {
      x: width * 0.02,
       y: height * 0.156,
      radius: Math.min(width, height) * 0.35,
      left:380,
      right:0,
      height:800,
      bh:70,
      bt:720
    },
    showGesture: true,
    gestureDirection: 'right',
    contentPosition: {
      position: 'absolute',
      bottom: 150,
      left: 20,
      right: 20,
    },
  },
  {
    title: "Swipe Left to Pass 👎",
    description: "Not your style? Swipe left to skip this item and see more options.",
    spotlight: {
      x: width * 0.02,
       y: height * 0.156,
      radius: Math.min(width, height) * 0.35,
      left:380,
      right:0,
      height:800,
      bh:70,
      bt:720
    },
    showGesture: true,
    gestureDirection: 'left',
    contentPosition: {
      position: 'absolute',
      bottom: 150,
      left: 20,
      right: 20,
    },
  },
  {
    title: "The Function💡",
    description: "With every swipe, the app learns your taste and curates your feed.",
    spotlight: {
      x: width * 0.02,
       y: height * 0.156,
      radius: Math.min(width, height) * 0.35,
      left:380,
      right:0,
      height:800,
      bh:70,
      bt:720
    },
    // showGesture: true,
    gestureDirection: 'left',
    contentPosition: {
      position: 'absolute',
      bottom: 150,
      left: 20,
      right: 20,
    },
  },
    {
    title: "Navigate through product images",
    description: "Tap on the right half to see more angles of the product",
    spotlight: {
      x: width * 0.6,
       y: height * 0.156,
      radius: Math.min(width, height) * 0.35,
      left:380,
      right:0,
      height:800,
      bh:70,
      bt:720
    },
    // showGesture: true,
    gestureDirection: 'left',
    contentPosition: {
      position: 'absolute',
      bottom: 150,
      left: 20,
      right: 20,
    },
  },
  {
    title: "Product info",
    description: "Tap here to learn more about the product",
    spotlight: {
      x: width * 0.8,
       y: height * 0.156,
      radius: Math.min(width, height) * 0.35,
      left:380,
      right:0,
      height:800,
      bh:800,
      bt:200
    },
    // showGesture: true,
    gestureDirection: 'up',
    contentPosition: {
      position: 'absolute',
      top: 150,
      left: 20,
      right: 20,
    },
  },
  {
    title: "Swipe Up to Add to Cart",
    description: "Ready to buy? Swipe up to add the item directly to your shopping cart!",
    spotlight: {
      x: width * 0.02,
       y: height * 0.156,
      radius: Math.min(width, height) * 0.35,
      left:380,
      right:0,
      height:800,
      bh:70,
      bt:720
    },
    showGesture: true,
    gestureDirection: 'up',
    contentPosition: {
      position: 'absolute',
      bottom: 150,
      left: 20,
      right: 20,
    },
  },
  {
    title: "Swipe Down to Save",
    description: "Want to think about it? Swipe down to save the item to your closets for later!",
    spotlight: {
      x: width * 0.02,
       y: height * 0.156,
      radius: Math.min(width, height) * 0.35,
      left:380,
      right:0,
      height:800,
      bh:70,
      bt:720
    },
    showGesture: true,
    gestureDirection: 'down',
    contentPosition: {
      position: 'absolute',
      top: 150,
      left: 20,
      right: 20,
    },
  },
  
  
  {
    title: "Your Closets",
    description: "Tap here to view all your closets to organize your favorites!",
    spotlight: {
      x: width * 0.2, // Adjust based on your tab bar layout
      y: height - 80,
      radius: 40,
      left:160,
      right:0,
      height:800,
      // bh:70,
      // bt:720
    },
    contentPosition: {
      position: 'absolute',
      bottom: 150,
      left: 20,
      right: 20,
    },
  },
  
  {
    title: "Explore Brands & Trends",
    description: "Discover new brands and items trending around you!",
    spotlight: {
      x: width * 0.4, // Adjust based on your tab bar layout
      y: height - 80,
      radius: 40,
      left:240,
      right:0,
      height:800,
    },
    contentPosition: {
      position: 'absolute',
      bottom: 150,
      left: 20,
      right: 20,
    },
  },
  {
    title: "Your Shopping Cart",
    description: "Review your selected items and proceed to checkout when you're ready to purchase.",
    spotlight: {
      x: width * 0.6, // Adjust based on your tab bar layout
      y: height - 80,
      radius: 40,
      left:330,
      right:0,
      height:800,
    },
    contentPosition: {
      position: 'absolute',
      bottom: 150,
      left: 20,
      right: 20,
    },
  },
  {
    title: "You're All Set! ✨",
     description: "We will leave the rest for you to explore. We built Shazlo for you—so make it yours.",
     contentPosition: {
      position: 'absolute',
      bottom: 200,
      left: 20,
      right: 20,
    },
    isLast: true,
  },
];

const navigationSteps = [
  {
    title: "Explore Your Navigation 🗺️",
    description: "Let's explore the different sections of the app to get the most out of your experience!",
    contentPosition: {
      position: 'absolute',
      top: 150,
      left: 20,
      right: 20,
    },
  },
  {
    title: "Saved Items 💾",
    description: "Tap here to view all the items you've saved to your closets. Organize your favorites!",
    spotlight: {
      x: width * 0.2, // Adjust based on your tab bar layout
      y: height - 80,
      radius: 40,
    },
    contentPosition: {
      position: 'absolute',
      bottom: 150,
      left: 20,
      right: 20,
    },
  },
  {
    title: "Explore Brands & Trends 🔍",
    description: "Discover new brands, trending items, and explore different fashion categories.",
    spotlight: {
      x: width * 0.4, // Adjust based on your tab bar layout
      y: height - 80,
      radius: 40,
    },
    contentPosition: {
      position: 'absolute',
      bottom: 150,
      left: 20,
      right: 20,
    },
  },
  {
    title: "Your Shopping Cart 🛍️",
    description: "Review your selected items and proceed to checkout when you're ready to purchase.",
    spotlight: {
      x: width * 0.6, // Adjust based on your tab bar layout
      y: height - 80,
      radius: 40,
    },
    contentPosition: {
      position: 'absolute',
      bottom: 150,
      left: 20,
      right: 20,
    },
  },
  {
    title: "You're All Set! ✨",
    description: "You now know how to navigate the app. Happy shopping and discovering new styles!",
    contentPosition: {
      position: 'absolute',
      bottom: 200,
      left: 20,
      right: 20,
    },
    isLast: true,
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: 400,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    // backgroundColor: 'rgba(0, 0, 0, 0.67)',
    zIndex: 2000,

  },
  overlayContent: {
    flex: 1,
    zIndex:100
  },
  spotlight: {
    position: 'absolute',
    // backgroundColor: 'rgba(255, 255, 255, 0.28)',
    borderWidth: 2,
    borderColor: 'rgba(180, 180, 180, 0.94)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 10,
  },
  tutorialContent: {
    backgroundColor: 'rgba(50, 50, 50, 0.95)',
    borderRadius: 16,
    padding: 20,
    margin: 20,
  },
  defaultContentPosition: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
  },
  tutorialTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
  },
  tutorialDescription: {
    fontSize: 16,
    color: 'whitesmoke',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,

    minWidth: 80,
  },
  primaryButton: {
    backgroundColor: 'white',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'white',
  },
  primaryButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  gestureAnimation: {
    alignItems: 'center',
    marginVertical: 20,
  },
  fingerPointer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#6c63ff',
    opacity: 0.8,
  },
  gestureTrail: {
    position: 'absolute',
    width: 2,
    height: 40,
    backgroundColor: '#6c63ff',
    opacity: 0.3,
    top: 20,
  },
});

export default TutorialOverlay;