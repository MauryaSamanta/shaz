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
  Share,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { useSelector } from 'react-redux';
import IconPressButton from './IconPressButton';
import ConfirmDialog from './ConfirmClosetDelete';

const { height } = Dimensions.get('window');

const ClosetDets = ({ closetData, visible, onClose, setClosets }) => {
  const [closet, setCloset] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});
  const [expanded, setExpanded] = useState(false);
  const user=useSelector((state)=>state.auth.user)
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;
  const [confirmVisible, setConfirmVisible] = useState(false);

const handleDeletePress = () => {
  setConfirmVisible(true);
};
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

  const handleShare = async () => {
    if (!closet) return;

    try {
      const shareUrl = `https://www.shazlo.store/open/closet/${closet.closet_id}`;
      const message = `Let's make a closet together, join and edit \n${shareUrl}`;

      await Share.share({
        message,
        url: shareUrl,
        title: 'Share Closet',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const deletecloset=async()=>{
    try {
      
      setClosets((prevClosets) =>
      prevClosets.filter((c) => c.closet_id !== closet.closet_id)
    );
     onClose();
      const response=await fetch(`https://shaz-dsdo.onrender.com/v1/closets/delete`, {
      method: 'POST',
      
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.user_id, closet_id:closet.closet_id }),
    })
   
    } catch (error) {
      console.log(error)
    }
  }


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
  <IconPressButton
    iconSource={require('../assets/images/share.png')}
    onPress={handleShare}
  />

  <IconPressButton
    iconSource={require('../assets/images/add-to-bag.png')}
    onPress={() => {}}
  />

  <IconPressButton
    iconSource={require('../assets/images/delete.png')}
    onPress={handleDeletePress}
  />
</View>

      </View>

      {/* Items list */}
      <View style={{ flex: 1 }}>
        <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          {closet.items.length === 0 ? (
            <Text style={styles.empty}>No items in this closet.</Text>
          ) : (
            <View style={styles.gridContainer}>
              {closet.items.map((item, index) => (
                <View key={`${item.item_id}-${index}`} style={styles.gridItem}>
                  <View style={{ position: 'relative' }}>
                    <Image
                      source={{ uri: `https://shaz-dsdo.onrender.com/v1/items/getimage?url=${encodeURIComponent(item.image_url)}` }}
                      style={styles.gridImage}
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
                      style={styles.gridCheckbox}
                    />
                  </View>
                  <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.price}>{item.price}</Text>
                </View>
              ))}
            </View>
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
        <ConfirmDialog
  visible={confirmVisible}
  title="Delete Closet?"
  message={`Are you sure you want to delete "${closet.name}"?`}
  onCancel={() => setConfirmVisible(false)}
  onConfirm={deletecloset}
/>
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
    paddingTop: 30,
  },

  cross: {
    position: 'absolute',
    top: 15,
    right: 20,
    zIndex: 10,
    paddingTop: 30
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

  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },

  gridItem: {
    width: '48%', // two per row
    marginBottom: 20,
    // alignItems: 'center',
  },

  gridImage: {
    width: '100%',
    aspectRatio: 0.75, // consistent image size
    borderRadius: 10,
    backgroundColor: '#f3f3f3',
  },

  gridCheckbox: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 10,
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
    borderRadius: 40
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
