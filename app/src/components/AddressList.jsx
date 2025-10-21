import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList, 
  Animated 
} from 'react-native';

const AddressList = ({ addressList, setSelectedAddress }) => {
  const [selectedId, setSelectedId] = useState(null);
  const [animatedValues] = useState(
    addressList.reduce((acc, item) => {
      acc[item.address_id] = {
        scale: new Animated.Value(1),
        elevation: new Animated.Value(4),
        borderWidth: new Animated.Value(0),
      };
      return acc;
    }, {})
  );

  const handleAddressPress = (item) => {
    const currentAnimated = animatedValues[item.address_id];
    const wasSelected = selectedId === item.address_id;
    
    // Reset all other animations
    Object.keys(animatedValues).forEach(id => {
      if (id !== item.address_id) {
        Animated.parallel([
          Animated.spring(animatedValues[id].scale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 120,
            friction: 8,
          }),
          Animated.timing(animatedValues[id].elevation, {
            toValue: 4,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValues[id].borderWidth, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }
    });

    if (wasSelected) {
      // Deselect current item
      Animated.parallel([
        Animated.spring(currentAnimated.scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 120,
          friction: 8,
        }),
        Animated.timing(currentAnimated.elevation, {
          toValue: 4,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(currentAnimated.borderWidth, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      setSelectedId(null);
      setSelectedAddress(null);
      return;
    } else {
      // Select new item with sexy animation
      Animated.parallel([
        Animated.spring(currentAnimated.scale, {
          toValue: 1.02,
          useNativeDriver: true,
          tension: 100,
          friction: 6,
        }),
        Animated.timing(currentAnimated.elevation, {
          toValue: 12,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(currentAnimated.borderWidth, {
          toValue: 2,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
      setSelectedId(item.address_id);
    }
    
    setSelectedAddress(item);
  };

  const renderAddressBox = ({ item }) => {
    const isSelected = selectedId === item.address_id;
    const animatedStyle = animatedValues[item.address_id];

    return (
      <Animated.View
        style={[
          styles.animatedContainer,
          {
            transform: [{ scale: animatedStyle.scale }],
            elevation: animatedStyle.elevation,
            
            borderWidth: animatedStyle.borderWidth,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.addressBox,
            // isSelected && styles.selectedAddressBox,
          ]}
          onPress={() => handleAddressPress(item)}
          activeOpacity={0.9}
        >
          <Text style={[
            styles.addressLine,
            // isSelected && styles.selectedText
          ]}>
            {item.address_line}
          </Text>
          <Text style={[
            styles.meta,
            // isSelected && styles.selectedMeta
          ]}>
            {item.city}, {item.state} - {item.pincode}
          </Text>
          {item.landmark ? (
            <Text style={[
              styles.landmark,
            //   isSelected && styles.selectedLandmark
            ]}>
              Landmark: {item.landmark}
            </Text>
          ) : null}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <FlatList
      data={addressList}
      renderItem={renderAddressBox}
      keyExtractor={item => item.address_id}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 5,
  },
  animatedContainer: {
    marginBottom: 12,
    borderColor: '#000',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
  },
  addressBox: {
    backgroundColor: '#f4f4f6',
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
  selectedAddressBox: {
    backgroundColor: '#f8f8fa',
  },
  addressLine: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#1e1e2e',
    transition: 'all 0.3s ease',
  },
  selectedText: {
    color: '#000',
    fontWeight: '700',
  },
  meta: {
    fontSize: 14,
    color: '#555',
    transition: 'all 0.3s ease',
  },
  selectedMeta: {
    color: '#333',
    fontWeight: '500',
  },
  landmark: {
    marginTop: 6,
    fontSize: 13,
    fontStyle: 'italic',
    color: '#777',
    transition: 'all 0.3s ease',
  },
  selectedLandmark: {
    color: '#555',
    fontWeight: '400',
  },
});

export default AddressList;