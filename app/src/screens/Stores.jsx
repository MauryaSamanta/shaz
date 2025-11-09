import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import SearchBar from '../components/SearchBar';

const stores = [
  {
    storeName:'Zara',
    name: 'Zara',
    tagline: "Dresses, tops, and more. Shop the latest trends.",
     image: require('../assets/images/zara-place.jpg'), // Replace with your asset path
  },
  {
    storeName:'MnS',
    name: 'Marks & Spencer',
    tagline: 'Latest Gen-Z Trends Under ₹999',
      image: require('../assets/images/ms-place.jpg'), 
  },
  {
    name: 'H & M',
    tagline: 'Delivery Starting From 30 Mins',
     image: require('../assets/images/hm_place.jpg'), 
  },
  {
    name: 'Forever New',
    tagline: 'Unlock The World Of Luxury',
      image: require('../assets/images/fn-place.jpg'), 
  },
];

const StoreLandingPage = ({ onSelectBrand }) => {
  return (
    <View style={styles.container} showsVerticalScrollIndicator={false}>
        
       <Image
                  source={require('../assets/images/shazlo-logo-v4.png')}
                  style={[{width:100, height:50, resizeMode:'contain', marginLeft:10}]}
                />

      
      <Text style={styles.heading}>Select Your Store</Text>
            <ScrollView style={styles.innerContainer} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 70 }} >
      {stores.map((store, index) => (
        <TouchableOpacity
          key={index}
          style={styles.storeCard}
          activeOpacity={0.8}
          onPress={() => {if(store.storeName==='Zara' || store.storeName==='MnS')onSelectBrand(store.storeName)}}
        >
        <Image
  source={store.image}
  style={[styles.banner]}
  resizeMode="cover"
/>
          <View style={styles.overlayTextContainer}>
            <Text style={styles.storeName}>{store.name}</Text>
            <Text style={styles.tagline}>{store.tagline}</Text>
            <Text style={styles.enter}>Enter Store →</Text>
          </View>
        </TouchableOpacity>
      ))}
      </ScrollView>
    </View>
  );
};
const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // paddingHorizontal: 12,
    paddingTop: 50,
    width: width,
    
  },
  innerContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingTop: 20,
    // paddingBottom: 50,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    // marginBottom: 10,
    paddingLeft: 15,
  },
  storeCard: {
    height: 160,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 14,
    position: 'relative',
  },
  searchContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 16,
  marginBottom: 10,
},

logoIcon: {
  width: 40,
  height: 40,
  marginRight: 10,
  borderRadius: 8,
},
 logoInsideBar: {
  width: 50,
  height: 50,
  resizeMode:'contain',
  marginRight: 8,
  borderRadius: 4,
},
searchBar: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#f0f0f0',
 borderRadius: 20,
  height: 44,
  paddingHorizontal: 10,
  // marginHorizontal: 16,
  // marginBottom: 10,
},

logoInsideBar: {
  width: 40,
  height: 40,
  marginRight: 8,
  borderRadius: 4,
},

searchPlaceholder: {
  fontSize: 14,
  color: '#777',
},


  banner: {
    width: '100%',
    height: '100%',
  },
  overlayTextContainer: {
    position: 'absolute',
    left: 16,
    top: 16,
  },
  storeName: {
    fontSize: 35,
    fontWeight: '700',
    color: 'white',
  },
  tagline: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
    marginVertical: 4,
  },
  enter: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginTop: 4,
  },
});

export default StoreLandingPage;
