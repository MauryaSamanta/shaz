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