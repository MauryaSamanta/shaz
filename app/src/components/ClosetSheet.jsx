import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
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

const { height, width } = Dimensions.get('window');

const ClosetDetailsSheet = forwardRef((props, ref) => {
  const animatedY = useRef(new Animated.Value(height)).current;
  const [closet, setCloset] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});
  const [expanded, setExpanded] = useState(false);
const scaleAnim = useRef(new Animated.Value(1)).current;
const colorAnim = useRef(new Animated.Value(0)).current; // 0 = black, 1 = white
// Add this along with bgColor
const borderRadiusAnim = scaleAnim.interpolate({
  inputRange: [1, 50], // matches your scale animation range
  outputRange: [30, 0], // from circle → square
  extrapolate: 'clamp',
});

const expand = () => {
  setExpanded(true);
  Animated.parallel([
    Animated.timing(scaleAnim, {
      toValue: 50, // scale up big enough to cover screen
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

const crumble=()=>{
    // setExpanded(true);
  Animated.parallel([
    Animated.timing(scaleAnim, {
      toValue: 1, // scale up big enough to cover screen
      duration: 300,
      useNativeDriver: false,
    }),
    Animated.timing(colorAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }),
  ]).start();
  setExpanded(false)
}

const bgColor = colorAnim.interpolate({
  inputRange: [0, 1],
  outputRange: ["black", "white"],
});

  const open = (closetData) => {
    setCloset(closetData);
    setSelectedItems({}); // reset selections
    Animated.timing(animatedY, {
      toValue: -50,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const close = () => {
    Animated.timing(animatedY, {
      toValue: height,
      duration: 300,
      useNativeDriver: false,
    }).start(() => setCloset(null));
  };

  useEffect(() => {
      const onBackPress = () => {
        if (expanded) {
          crumble();
          // closetSheetRef.current.close();
          return true; // consumed
        }
       
        return false; // let system handle (exit screen / app)
      };
  
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [expanded]);

  useImperativeHandle(ref, () => ({
    open,
    close,
  }));

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const { y0 } = evt.nativeEvent;
        return y0 < 100 && gestureState.dy > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          animatedY.setValue(height * 0.1 + gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 700) {
          close();
        } else {
          open(closet);
        }
      },
    })
  ).current;

  if (!closet) return null;

  const selectedCount = Object.values(selectedItems).filter(Boolean).length;

  return (
    <Animated.View style={[styles.sheet, { top: animatedY }]} >
      <View {...panResponder.panHandlers}>
        {/* <View style={styles.dragIndicator} /> */}
        <TouchableOpacity onPress={close} style={styles.cross}>
          <Text style={{ fontSize: 20 }}>✕</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{closet.name}</Text>

        <View style={styles.topRow}>
          <Text style={styles.selectionText}>
            {selectedCount}/{closet.items.length} selected
          </Text>
          <View style={styles.buttonRow}>
            <TouchableWithoutFeedback>
              <View style={styles.actionButton}>
               <Image source={require('../assets/images/share.png')} style={{width:20, height:20, tintColor: 'black'}}/>
              </View>
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback>
              <View style={styles.actionButton}>
                <Image source={require('../assets/images/add-to-bag.png')} style={{width:20, height:20, tintColor: 'black'}}/>
              </View>
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback>
              <View style={styles.actionButton}>
               <Image source={require('../assets/images/delete.png')} style={{width:20, height:20, tintColor: 'black'}}/>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          {closet.items.length === 0 ? (
            <Text style={styles.empty}>No items in this closet.</Text>
          ) : (
            closet.items.map((item,index) => (
              <View key={`${item.item_id}-${index}`} style={styles.card} >
                <View style={{ position: 'relative' }}>
                  <Image
                    source={{ uri: `https://shaz-dmfl.onrender.com/v1/items/getimage?url=${encodeURIComponent(item.image_url)}` }}
                    style={styles.image}
                  />
                  <CheckBox
                    value={!!selectedItems[item.item_id]}
                    onValueChange={(newValue) =>{
                      console.log(`Checkbox for item ${item.item_id} changed to:`, newValue);
                      setSelectedItems((prev) => ({
                        ...prev,
                        [item.item_id]: newValue,
                      }))}}
                     tintColors={{ true: 'black', false: 'black' }} 
                    style={styles.checkbox}
                  />
                </View>
                <View style={styles.details}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.price}>{item.price}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>

   <View style={styles.bottomButtonContainer}>
  {/* animated bubble background (absolute, doesn't block touches) */}
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

  {/* Foreground button (visible black pill with text centered) */}
  {!expanded && (
    <TouchableOpacity onPress={expand} style={styles.bottomButtonForeground}>
      <Text style={styles.bottomButtonText}>Discover Similar</Text>
    </TouchableOpacity>
  )}

  {/* Expanded full-screen content (normal size, NOT scaled) */}
  {expanded && (
    <View style={styles.fullContent}>
      <Text style={{ fontSize: 20, color: 'black' }}>Expanded Content Here</Text>
    </View>
  )}
</View>


    </Animated.View>
  );
});

export default ClosetDetailsSheet;

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: height,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    zIndex: 1000,
  },
  dragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 10,
  },
  cross: {
    position: 'absolute',
    top: 15,
    right: 20,
    zIndex: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
    zIndex:100
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
  position: "absolute",
  bottom: 20,
  left: 0,
  right: 0,
  alignItems: "center",
  justifyContent: "center",
  height: 100,
},

// background bubble size - will be animated (keeps default circular shape)
animatedBubble: {
  width: 20,
  height: 23,
  // borderRadius: 30,
  overflow: "hidden",
  zIndex: 0,
},

// the visible button that sits ON TOP of the animated bubble
bottomButtonForeground: {
  zIndex: 10,
  backgroundColor: 'black',   // visible black pill
  paddingHorizontal: 20,
  paddingVertical: 12,
  borderRadius: 30,
  alignItems: 'center',
  justifyContent: 'center',
  elevation: 4, // slight shadow on Android (optional)
},

bottomButtonText: {
  color: "white",
  fontSize: 16,
  fontWeight: "600",
},

fullContent: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: "center",
  alignItems: "center",
},

});
