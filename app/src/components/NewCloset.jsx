import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';

const { height } = Dimensions.get('window');

const NewClosetSheet = forwardRef(({ onAddCloset }, ref) => {
  const [closetName, setClosetName] = useState('');
  const animatedY = useRef(new Animated.Value(height)).current;
  const user=useSelector((state)=>state.auth.user);
  const [loading,setloading]=useState(false)
  // Show the sheet
  const open = () => {
    Animated.timing(animatedY, {
      toValue: height * 0.2, // 40% from bottom
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // Hide the sheet
  const close = () => {
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

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          animatedY.setValue(height * 0.6 + gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          close();
        } else {
          open();
        }
      },
    })
  ).current;

  const handleSubmit = async() => {
   try {
    setloading(true)
    const data={
         user_id :user.user_id,
        name :closetName
    }
     const response=await fetch('https://shaz-dmfl.onrender.com/v1/closets/create/',{
        method:'POST',
        headers:{"Content-type":"application/json"},
        body:JSON.stringify(data)
     })
     const returneddata=await response.json();
     const newcloset={
        id:returneddata.closet_id,
          closet_id:returneddata.closet_id,
            name: returneddata.name,
            items: returneddata.items
     }
    //  console.log(newcloset);
      onAddCloset(newcloset); 
      setloading(false)
    setClosetName('');
    close();
   } catch (error) {
    console.log(error)
   }
  };

  return (
    <Animated.View
      style={[
        styles.sheet,
        {
          top: animatedY,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <View style={styles.dragIndicator} />
      <TouchableOpacity onPress={close} style={styles.cross}>
        <Text style={{ fontSize: 20 }}>✕</Text>
      </TouchableOpacity>
      <Text style={styles.label}>Creating New Closet</Text>
      <TextInput
        placeholder="Enter closet name"
        placeholderTextColor="grey"
        value={closetName}
        onChangeText={setClosetName}
        style={styles.input}
      />
      <TouchableOpacity onPress={handleSubmit} style={styles.addButton} disabled={!closetName}>
       {!loading?( <Text style={{ color: 'white', fontWeight: 'bold' }}>Add Closet</Text>):(
        <ActivityIndicator size="small" color="#fff" />
       )}
      </TouchableOpacity>
    </Animated.View>
  );
});

export default NewClosetSheet;

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: height * 0.4 + 100,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
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
  label: {
    fontSize: 16,
    marginBottom: 10,
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: 'black',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
});
