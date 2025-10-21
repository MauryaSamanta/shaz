import { Animated, Easing, Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

export const circularRevealInterpolator = ({ current, layouts }) => {
  const radius = Math.hypot(width, height); // diagonal for full screen

  const scale = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, radius], // expand from 0 to full screen
  });

  return {
    cardStyle: {
      opacity: current.progress,
      transform: [
        {
          scale: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0.1, 1],
            extrapolate: 'clamp',
          }),
        },
      ],
      borderRadius: current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [width / 2, 0], // circle → full screen
      }),
    },
  };
};
