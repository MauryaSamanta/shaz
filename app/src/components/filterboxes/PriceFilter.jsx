import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function PriceFilterDialog({ visible, onClose, onApply, onClear }) {
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Animated values
  const circleScale = useRef(new Animated.Value(0)).current; // for circle reveal
  const dialogScale = useRef(new Animated.Value(0.8)).current;
  const dialogOpacity = useRef(new Animated.Value(0)).current;

  // local visible flag to keep modal mounted while animating out
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      // show animation: circle grows, dialog scales up & fades in
      Animated.parallel([
        Animated.timing(circleScale, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(dialogScale, {
          toValue: 1,
          friction: 7,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(dialogOpacity, {
          toValue: 1,
          duration: 200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    } else if (mounted) {
      // hide animation: reverse animations then unmount and call onClose
      Animated.parallel([
        Animated.timing(dialogOpacity, {
          toValue: 0,
          duration: 160,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(dialogScale, {
          toValue: 0.85,
          duration: 160,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(circleScale, {
          toValue: 0,
          duration: 300,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setMounted(false);
        // ensure onClose still called so parent knows
        if (onClose) onClose();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const clearFields = () => {
    setMinPrice('');
    setMaxPrice('');
    if (onClear) onClear();
    if (onApply) onApply('', '');
  };

  if (!mounted) return null;

  // circle sizing: large enough to cover screen when scaled to 1
  const CIRCLE_SIZE = Math.max(width, height) * 1.8; // big circle

  const circleTransform = {
    transform: [
      {
        scale: circleScale.interpolate({
          inputRange: [0, 1],
          outputRange: [0.001, 1], // avoid 0 to prevent rendering issues
        }),
      },
    ],
  };

  const dialogAnimatedStyle = {
    opacity: dialogOpacity,
    transform: [{ scale: dialogScale }],
  };

  return (
    <Modal transparent animationType="none" visible={mounted} onRequestClose={() => {
      // This will trigger the parent to set visible=false and animation will run
      if (onClose) onClose();
    }}>
      <View style={styles.overlay}>
        {/* Circular reveal behind dialog */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.revealCircle,
            {
              width: CIRCLE_SIZE,
              height: CIRCLE_SIZE,
              borderRadius: CIRCLE_SIZE / 2,
              // position it centered behind dialog
              left: (width - CIRCLE_SIZE) / 2,
              top: (height - CIRCLE_SIZE) / 2,
            },
            circleTransform,
          ]}
        />

        {/* Dialog */}
        <Animated.View style={[styles.dialog, dialogAnimatedStyle]}>
          <View style={styles.priceRow}>
            <View style={styles.priceBlock}>
              <Text style={styles.label}>Min</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.currency}>₹</Text>
                <TextInput
                  value={minPrice}
                  onChangeText={setMinPrice}
                  placeholder="0"
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
            </View>

            <Text style={styles.hyphen}>-</Text>

            <View style={styles.priceBlock}>
              <Text style={styles.label}>Max</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.currency}>₹</Text>
                <TextInput
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                  placeholder="1000"
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.clearButton} onPress={clearFields}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                if (onApply) onApply(minPrice, maxPrice);
              }}
            >
              <Text style={styles.addText}>Add</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    // keep overlay dark but let circle reveal feel like it's popping from center
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  revealCircle: {
    position: 'absolute',
    backgroundColor: 'transparent', // the circle color; choose white to match dialog
    opacity: 1,
  },
  dialog: {
    width: width * 0.8,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    // small shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    width: '100%',
  },
  priceBlock: {
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    width: 100,
    height: 40,
  },
  currency: {
    fontSize: 16,
    color: '#555',
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    textAlign: 'left',
    paddingVertical: 0,
  },
  hyphen: {
    fontSize: 20,
    color: '#666',
    marginHorizontal: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between',
    width: '100%',
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#eee',
    padding: 12,
    borderRadius: 12,
    marginRight: 10,
    alignItems: 'center',
  },
  clearText: {
    color: '#333',
    fontWeight: '600',
  },
  addButton: {
    flex: 1,
    backgroundColor: 'black',
    padding: 12,
    borderRadius: 12,
    marginLeft: 10,
    alignItems: 'center',
  },
  addText: {
    color: 'white',
    fontWeight: '600',
  },
});
