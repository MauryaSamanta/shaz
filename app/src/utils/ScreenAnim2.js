import React, { useEffect, useRef } from "react";
import { View, Animated, Dimensions, Easing } from "react-native";

const { width, height } = Dimensions.get("window");

const CircularRevealWrapper = ({ activeScreen, children }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [activeScreen]);

  const animatedStyle = {
    transform: [
      { scale: anim },
    ],
    borderRadius: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [width, 0], // start fully round, end square
    }),
    opacity: anim,
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white", paddingBottom:70 }}>
      <Animated.View
        style={[
          {
            flex: 1,
            overflow: "hidden",
            transformOrigin: "bottom center", // for expo / RN web
          },
          animatedStyle,
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
};

export default CircularRevealWrapper;
