import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
} from 'react';
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
  Image,
} from 'react-native';
import { useSelector } from 'react-redux';

const { height, width } = Dimensions.get('window');

const SelectClosetSheet = forwardRef(
  ({ onSave, itemId, movetonext, itemimage, handleScreenChange, closets, setclosets }, ref) => {
    const user = useSelector((state) => state.auth.user);

    // const [closets, setClosets] = useState([]);
    const [isVisible, setIsVisible] = useState(false);
    const [creatingNew, setCreatingNew] = useState(false);
    const [newClosetName, setNewClosetName] = useState('');
    const [loadingnewcloset, setloadingnewcloset] = useState(false);

    const animatedY = useRef(new Animated.Value(height * 4)).current;
    const selectedIdsRef = useRef([]); // ✅ ref replaces useState
    const [, forceRender] = useState(0); // to trigger UI update manually

    // Handle Android back button
    useEffect(() => {
      const backAction = () => {
        if (isVisible) {
          close();
          return true;
        }
        return false;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      );

      return () => backHandler.remove();
    }, [isVisible]);

    const open = () => {
      setIsVisible(true);
      // fetchClosets();
      Animated.timing(animatedY, {
        toValue: height * 0.15,
        duration: 300,
        useNativeDriver: false,
      }).start();
    };

    const close = () => {
      if(selectedIdsRef?.current?.length>0)
      handleSave();
      setIsVisible(false);
      selectedIdsRef.current=[]
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

    

    const toggleSelect = (id) => {
      const prev = selectedIdsRef.current;
      if (prev.includes(id)) {
        selectedIdsRef.current = prev.filter((item) => item !== id);
      } else {
        selectedIdsRef.current = [...prev, id];
      }
      forceRender((n) => n + 1); // ✅ manually re-render to reflect UI
    };

    const panResponder = useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          gestureState.dy > 10 &&
          Math.abs(gestureState.dx) < Math.abs(gestureState.dy),
        onPanResponderGrant: () => {
          animatedY.stopAnimation();
        },
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy > 0) {
            const newValue = height * 0.2 + gestureState.dy;
            animatedY.setValue(Math.max(height * 0.2, newValue));
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          const dragDistance = gestureState.dy;
          const dragVelocity = gestureState.vy;
          if (dragDistance > height * 0.15 || dragVelocity > 1.5) {
            close();
          } else {
            Animated.timing(animatedY, {
              toValue: height * 0.2,
              duration: 200,
              useNativeDriver: false,
            }).start();
          }
        },
      }),
    ).current;

    const handleCreateCloset = async () => {
      if (!newClosetName.trim()) return;
      setloadingnewcloset(true);
      try {
        const response = await fetch(
          'https://shaz-dsdo.onrender.com/v1/closets/create/',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newClosetName, user_id: user.user_id }),
          },
        );

        if (response.ok) {
          const newCloset = await response.json();
          setclosets((prev) => [newCloset, ...prev]);
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
      const data = {
        item_id: itemId,
        closet_ids: selectedIdsRef.current, // ✅ using ref
        preference_vector: user.preference_vector,
        user_id: user.user_id,
      };
      try {
        await fetch('https://shaz-dsdo.onrender.com/v1/closets/add-item/', {
          method: 'POST',
          headers: { 'Content-type': 'application/json' },
          body: JSON.stringify(data),
        });
      } catch (error) {
        console.log(error);
      }
      console.log('saved', selectedIdsRef.current);
    };

    const renderItem = ({ item }) => {
      const selected = selectedIdsRef.current.includes(item.closet_id);
      return (
       <View style={styles.item}>
  <Text style={styles.itemText}>{item.name}</Text>

  <TouchableOpacity onPress={() => toggleSelect(item.closet_id)}>
    <View
      style={[
        styles.iconButton,
        { backgroundColor: selected ? "black" : "#e0e0e0" },
      ]}
    >
      <Text
        style={{
          color: selected ? "white" : "black",
          fontSize: 16,
          fontWeight: "bold",
        }}
      >
        {selected ? "✔" : "+"}
      </Text>
    </View>
  </TouchableOpacity>
</View>

      );
    };

    return (
      <TouchableWithoutFeedback
        onPress={() => {
          if (creatingNew) {
            setCreatingNew(false);
            setNewClosetName('');
            Keyboard.dismiss();
          }
        }}
      >
        <Animated.View style={[styles.sheet, { top: animatedY }]}>
          <View
            style={[
              {
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
              },
            ]}
          >
            <Text style={styles.title}>Adding to Closet</Text>
            <TouchableWithoutFeedback onPress={close}>
              <Text style={[{ fontSize: 20 }]}>✕</Text>
            </TouchableWithoutFeedback>
          </View>

          <View style={[{ display: 'flex', alignItems: 'center' }]}>
            <Image
              source={{
                uri: `https://shaz-dsdo.onrender.com/v1/items/getimage?url=${encodeURIComponent(
                  itemimage,
                )}`,
              }}
              style={[{ width: 100, height: 150, borderRadius: 10 }]}
              resizeMode="contain"
            />
          </View>

          {creatingNew ? (
            <View style={styles.newClosetContainer}>
              <TextInput
                placeholder="Enter closet name"
                placeholderTextColor="#888"
                value={newClosetName}
                onChangeText={setNewClosetName}
                style={styles.newClosetInput}
              />
              <TouchableOpacity
                onPress={handleCreateCloset}
                style={styles.tickButton}
                disabled={loadingnewcloset}
              >
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
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 20,
                      fontWeight: 'bold',
                      lineHeight: 20,
                    }}
                  >
                    +
                  </Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
          )}

          <FlatList
            data={closets}
            keyExtractor={(item) => item?.closet_id?.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  },
);

export default SelectClosetSheet;

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: height * 0.85,
    backgroundColor: 'whitesmoke',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    zIndex: 1000,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
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
  iconButton: {
  width: 26,
  height: 26,
  borderRadius: 18,
  justifyContent: "center",
  alignItems: "center",
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
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tick: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
