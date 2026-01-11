import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, Animated, Easing } from 'react-native';
import { useSelector } from 'react-redux';

const RewardBadge = () => {
  const user = useSelector(state => state.auth.user);
  const [prevRewards, setPrevRewards] = useState(user?.rewards || 0);
  const [showPlusOne, setShowPlusOne] = useState(false);

  // Animated values
  const moveAnim = useRef(new Animated.Value(0)).current; // vertical move
  const fadeAnim = useRef(new Animated.Value(0)).current; // opacity

  useEffect(() => {
    if (user?.rewards > prevRewards) {
      // trigger +1 animation
      setShowPlusOne(true);
      moveAnim.setValue(0);
      fadeAnim.setValue(1);

      Animated.parallel([
        Animated.timing(moveAnim, {
          toValue: -30, // move up
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(fadeAnim, {
          toValue: 0, // fade out
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowPlusOne(false);
      });
    }
    setPrevRewards(user?.rewards || 0);
  }, [user?.rewards]);

  if (!user?.name) return null;

  return (
    <TouchableOpacity
      style={{
        position: 'absolute',
        right: 50,
        alignItems: 'center',
      }}
      activeOpacity={0.8}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'black',
          borderRadius: 10,
          paddingRight: 10,
          paddingLeft: 20,
        }}
      >
        <Image
          source={require('../assets/images/coin.png')}
          style={{
            width: 25,
            height: 25,
            position: 'absolute',
            left: -10,
          }}
        />
        <Text style={{ fontSize: 20, fontWeight: '800', color: '#FFD700' }}>
          {user.rewards || 0}
        </Text>

        {showPlusOne && (
          <Animated.Text
            style={{
              position: 'absolute',
              left: 20, // near the text
              bottom: 20,
              color: '#FFD700',
              fontWeight: 'bold',
              fontSize: 18,
              transform: [{ translateY: moveAnim }],
              opacity: fadeAnim,
            }}
          >
            +2
          </Animated.Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default RewardBadge;
