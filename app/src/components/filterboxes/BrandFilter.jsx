import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function BrandFilterDialog({
  visible,
  onClose,
  onApply,
  brandList = [],
  onClear,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBrands, setFilteredBrands] = useState(brandList || []);
  const [selectedBrands, setSelectedBrands] = useState([]);

  // Animated values (same pattern as your PriceFilterDialog)
  const circleScale = useRef(new Animated.Value(0)).current; // for circle reveal
  const dialogScale = useRef(new Animated.Value(0.8)).current;
  const dialogOpacity = useRef(new Animated.Value(0)).current;

  // local visible flag to keep modal mounted while animating out
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredBrands(brandList);
    } else {
      setFilteredBrands(
        brandList.filter((brand) =>
          brand.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, brandList]);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      // show animation: circle grows, dialog scales up & fades in
      Animated.parallel([
        Animated.timing(circleScale, {
          toValue: 1,
          duration: 420,
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
        if (onClose) onClose();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const toggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const clearSelection = () => {
    setSelectedBrands([]);
    setSearchTerm('');
    if (onClear) onClear();
    // Keep behavior same as your original: ask parent to close (parent should set visible=false,
    // which triggers the hide animation above). If you prefer not to close, remove next line.
    if (onClose) onClose();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => toggleBrand(item)} style={styles.brandItem}>
      <View style={styles.checkbox}>
        {selectedBrands.includes(item) && <View style={styles.checked} />}
      </View>
      <Text style={styles.brandText}>{item}</Text>
    </TouchableOpacity>
  );

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
    <Modal
      transparent
      animationType="none"
      visible={mounted}
      onRequestClose={() => {
        // Trigger parent to close (parent should set visible=false)
        if (onClose) onClose();
      }}
    >
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
              left: (width - CIRCLE_SIZE) / 2,
              top: (height - CIRCLE_SIZE) / 2,
            },
            circleTransform,
          ]}
        />

        {/* Dialog */}
        <Animated.View style={[styles.dialog, dialogAnimatedStyle]}>
          <Text style={styles.title}>Select Brands</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search brands..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          <FlatList
            data={filteredBrands}
            keyExtractor={(item) => item}
            renderItem={renderItem}
            style={styles.list}
            keyboardShouldPersistTaps="handled"
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.clearButton} onPress={clearSelection}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                if (onApply) onApply(selectedBrands);
                // ask parent to close so hide animation runs
                if (onClose) onClose();
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
    backgroundColor: 'transparent', // circle color matches dialog background
    opacity: 1,
  },
  dialog: {
    width: width * 0.85,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    elevation: 10,
    // shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    alignSelf: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  searchInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 12,
  },
  list: {
    flexGrow: 0,
    maxHeight: 300,
  },
  brandItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  brandText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: '#555',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checked: {
    width: 12,
    height: 12,
    backgroundColor: 'black',
    borderRadius: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
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
