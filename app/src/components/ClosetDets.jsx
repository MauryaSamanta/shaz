import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  TouchableWithoutFeedback,
  BackHandler,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';

const { height } = Dimensions.get('window');

const ClosetDets = ({ closetData, visible, onClose }) => {
  const [closet, setCloset] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});
  const [expanded, setExpanded] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;

  const borderRadiusAnim = scaleAnim.interpolate({
    inputRange: [1, 50],
    outputRange: [30, 0],
    extrapolate: 'clamp',
  });

  const expand = () => {
    setExpanded(true);
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 50,
        duration: 600,
        useNativeDriver: false,
      }),
      Animated.timing(colorAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const crumble = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(colorAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
    setExpanded(false);
  };

  const bgColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['black', 'white'],
  });

  useEffect(() => {
    if (visible && closetData) {
      setCloset(closetData);
      setSelectedItems({});
    } else {
      setCloset(null);
    }
  }, [visible, closetData]);

  useEffect(() => {
    const onBackPress = () => {
      if (expanded) {
        crumble();
        return true;
      }
      if (visible) {
        onClose?.();
        return true;
      }
      return false;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [expanded, visible]);

  if (!closet) return null;

  const selectedCount = Object.values(selectedItems).filter(Boolean).length;

  return (
    <View style={styles.sheet}>
      {/* Close button */}
      <TouchableOpacity onPress={onClose} style={styles.cross}>
        <Text style={{ fontSize: 20 }}>✕</Text>
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>{closet.name}</Text>

      {/* Top row */}
      <View style={styles.topRow}>
        <Text style={styles.selectionText}>
          {selectedCount}/{closet.items.length} selected
        </Text>
        <View style={styles.buttonRow}>
          <TouchableWithoutFeedback>
            <View style={styles.actionButton}>
              <Image source={require('../assets/images/share.png')} style={{ width: 20, height: 20, tintColor: 'black' }} />
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback>
            <View style={styles.actionButton}>
              <Image source={require('../assets/images/add-to-bag.png')} style={{ width: 20, height: 20, tintColor: 'black' }} />
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback>
            <View style={styles.actionButton}>
              <Image source={require('../assets/images/delete.png')} style={{ width: 20, height: 20, tintColor: 'black' }} />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </View>

      {/* Items list */}
      <View style={{ flex: 1 }}>
        <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          {closet.items.length === 0 ? (
            <Text style={styles.empty}>No items in this closet.</Text>
          ) : (
            closet.items.map((item, index) => (
              <View key={`${item.item_id}-${index}`} style={styles.card}>
                <View style={{ position: 'relative' }}>
                  <Image
                    source={{ uri: `http://192.168.31.12:8000/v1/items/getimage?url=${encodeURIComponent(item.image_url)}` }}
                    style={styles.image}
                  />
                  <CheckBox
                    value={!!selectedItems[item.item_id]}
                    onValueChange={(newValue) => {
                      setSelectedItems((prev) => ({
                        ...prev,
                        [item.item_id]: newValue,
                      }));
                    }}
                    tintColors={{ true: 'black', false: 'black' }}
                    style={styles.checkbox}
                  />
                </View>
                <View style={styles.details}>
                  <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.price}>{item.price}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      {/* Bottom button */}
      <View style={styles.bottomButtonContainer}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.animatedBubble,
            {
              position: 'absolute',
              transform: [{ scale: scaleAnim }],
              backgroundColor: bgColor,
              borderRadius: borderRadiusAnim,
            },
          ]}
        />

        {!expanded && (
          <TouchableOpacity onPress={expand} style={styles.bottomButtonForeground}>
            <Text style={styles.bottomButtonText}>Discover Similar</Text>
          </TouchableOpacity>
        )}

        {expanded && (
          <View style={styles.fullContent}>
            <Text style={{ fontSize: 20, color: 'black' }}>Expanded Content Here</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default ClosetDets;

const styles = StyleSheet.create({
sheet: {
  position: 'absolute',      // make it overlay
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'white',
  padding: 16,
  zIndex: 1000,              // ensure it sits on top
  paddingTop:30,
},

  cross: {
    position: 'absolute',
    top: 15,
    right: 20,
    zIndex: 10,
    paddingTop:30
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    // marginBottom: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 20,
  },
  selectionText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'gray',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 6,
  },
  scroll: {
    marginTop: 10,
  },
  card: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingBottom: 8,
  },
  image: {
    width: 160,
    height: 180,
    borderRadius: 8,
    marginRight: 12,
  },
  checkbox: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 100,
    borderRadius:40
  },
  details: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    color: 'gray',
  },
  empty: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: 'gray',
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  animatedBubble: {
    width: 20,
    height: 23,
    overflow: 'hidden',
    zIndex: 0,
  },
  bottomButtonForeground: {
    zIndex: 10,
    backgroundColor: 'black',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  bottomButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  fullContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
