import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  PanResponder,
  TextInput,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  BackHandler,
} from 'react-native';
import { useSelector } from 'react-redux';

const { height,width } = Dimensions.get('window');

const SelectClosetSheet = forwardRef(({ onSave, itemId, movetonext }, ref) => {
  const user = useSelector((state) => state.auth.user);
  const [closets, setClosets] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const animatedY = useRef(new Animated.Value(height)).current;
  const [creatingNew, setCreatingNew] = useState(false);
  const [newClosetName, setNewClosetName] = useState('');
  const [loadingnewcloset, setloadingnewcloset] = useState(false);

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      if (isVisible) {
        close();
        return true; // Prevent default back action
      }
      return false; // Allow default back action
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [isVisible]);

  const open = () => {
    setIsVisible(true);
    fetchClosets();
    Animated.timing(animatedY, {
      toValue: height * 0.2,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const close = () => {
    setIsVisible(false);
    setCreatingNew(false);
    setNewClosetName('');
    Keyboard.dismiss();
    Animated.timing(animatedY, {
      toValue: height,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  useImperativeHandle(ref, () => ({
    open,
    close,
  }));

  const fetchClosets = async () => {
    try {
      const response = await fetch(`https://shaz-dsdo.onrender.com/v1/closets/${user.user_id}`, {
        method: 'GET'
      });
      const data = await response.json();
      setClosets(data);
      setSelectedIds([]);
    } catch (error) {
      console.log(error);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to downward gestures
        return gestureState.dy > 10 && Math.abs(gestureState.dx) < Math.abs(gestureState.dy);
      },
      onPanResponderGrant: () => {
        // Stop any ongoing animations when user starts dragging
        animatedY.stopAnimation();
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          // Only allow dragging down from the initial position
          const newValue = height * 0.2 + gestureState.dy;
          animatedY.setValue(Math.max(height * 0.2, newValue));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const dragDistance = gestureState.dy;
        const dragVelocity = gestureState.vy;
        
        // Close if dragged down significantly or with high velocity
        if (dragDistance > height * 0.15 || dragVelocity > 1.5) {
          close();
        } else {
          // Snap back to open position
          Animated.timing(animatedY, {
            toValue: height * 0.2,
            duration: 200,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const handleCreateCloset = async () => {
    if (!newClosetName.trim()) return;
    setloadingnewcloset(true);
    try {
      const response = await fetch('https://shaz-dsdo.onrender.com/v1/closets/create/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newClosetName, user_id: user.user_id }),
      });

      if (response.ok) {
        const newCloset = await response.json();
        setClosets((prev) => [newCloset, ...prev]);
        setNewClosetName('');
        setCreatingNew(false);
      }
    } catch (error) {
      console.error('Failed to create closet:', error);
    } finally {
      setloadingnewcloset(false);
    }
  };

  const handleSave = async () => {
     movetonext();
    close();
   
    const data = { item_id: itemId, closet_ids: selectedIds, preference_vector: user.preference_vector };
    try {
      await fetch('https://shaz-dsdo.onrender.com/v1/closets/add-item/', {
        method: 'POST',
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.log(error)
    }

    console.log('saved')
  };

  const renderItem = ({ item }) => {
    const selected = selectedIds.includes(item.closet_id);

    return (
      <TouchableOpacity onPress={() => toggleSelect(item.closet_id)} style={styles.item}>
        <Text style={styles.itemText}>{item.name}</Text>
        {selected && (
          <View style={styles.selectedCircle}>
            <Text style={styles.tick}>✔</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        // Close input if open
        if (creatingNew) {
          setCreatingNew(false);
          setNewClosetName('');
          Keyboard.dismiss();
        }
      }}
    >
      <Animated.View style={[styles.sheet, { top: animatedY }]}>
        {/* Drag handle area */}
        <View style={styles.dragHandle} {...panResponder.panHandlers}>
          <View style={styles.dragIndicator} />
        </View>
        
        <Text style={styles.title}>Select Closets</Text>
        {creatingNew ? (
          <View style={styles.newClosetContainer}>
            <TextInput
              placeholder="Enter closet name"
              placeholderTextColor="#888"
              value={newClosetName}
              onChangeText={setNewClosetName}
              style={styles.newClosetInput}
            />
            <TouchableOpacity onPress={handleCreateCloset} style={styles.tickButton} disabled={loadingnewcloset}>
              {loadingnewcloset ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.tickText}>✔</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableWithoutFeedback onPress={() => setCreatingNew(true)}>
            <View style={styles.createButton}>
              <Text style={styles.createText}>Create New Closet</Text>
              <View
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 18,
                  display: 'flex',
                  backgroundColor: 'black',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', lineHeight: 20, }}>+</Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        )}

        <FlatList
          data={closets}
          keyExtractor={(item) => item.closet_id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
});

export default SelectClosetSheet;

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: height * 0.8,
    // width:width*0.8,
    backgroundColor: 'whitesmoke',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    marginLeft:20,
    marginRight:20,
    zIndex: 1000,
  },
  dragHandle: {
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: -10,
    marginHorizontal: -20,
  },
  dragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  newClosetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  newClosetInput: {
    flex: 1,
    fontSize: 16,
    color: 'black',
  },
  tickButton: {
    marginLeft: 10,
    backgroundColor: 'black',
    padding: 6,
    borderRadius: 6,
  },
  tickText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  createButton: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  createText: {
    fontSize: 16,
    color: 'black',
    fontWeight: '600',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  itemText: {
    fontSize: 16,
    color: 'black',
  },
  selectedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    display: 'flex',
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tick: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 16,
  },
  unselectedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  check: {
    fontSize: 20,
    color: '#ccc',
  },
  checked: {
    color: '#000',
  },
  saveButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    width: '100%',
    backgroundColor: 'black',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});