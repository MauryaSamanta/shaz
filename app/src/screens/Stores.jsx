import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import SearchBar from '../components/SearchBar';
import LinearGradient from 'react-native-linear-gradient';

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
    name: 'Bulbul Fashions',
    storeName: 'Bulbul Fashions',
    tagline: 'Delivery Starting From 30 Mins',
     image: require('../assets/images/hm_place.jpg'), 
  },
  {
    name: 'Bonkers Corner',
    storeName: 'Bonkers Corner',
    tagline: 'Unlock The World Of Luxury',
      image: require('../assets/images/fn-place.jpg'), 
  },
  {
    name: 'Chimpanzee',
    storeName: 'Chimpanzee',
    tagline: 'Unlock The World Of Luxury',
      image: require('../assets/images/fn-place.jpg'), 
  },
  {
    name: 'Souled Store',
    storeName: 'Souled Store',
    tagline: 'Unlock The World Of Luxury',
      image: require('../assets/images/fn-place.jpg'), 
  },
  {
    name: 'Bijoi',
    storeName: 'Bijoi',
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
              
     {stores.map((store, index) => {
  const isActive = true;

  return (
    <TouchableOpacity
  key={index}
  activeOpacity={0.85}
  onPress={() => {
    if (isActive) onSelectBrand(store.storeName);
  }}
  style={[
    styles.storeRow,
    !isActive && styles.disabledRow
  ]}
>
  {/* LEFT CONTENT */}
  <View style={styles.rowInner}>
    <Text style={styles.bigName}>{store.name}</Text>

    <View style={styles.metaRow}>
      <View style={styles.line} />
      <Text style={styles.actionText}>
        {isActive ? 'Enter Store' : 'Coming Soon'}
      </Text>
    </View>
  </View>

  {/* RIGHT GHOST LETTER */}
  <Text style={styles.ghostLetter}>
    {store.name.charAt(0)}
  </Text>
</TouchableOpacity>


  );
})}


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
storeRow: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 36,
  paddingHorizontal: 18,
  overflow: 'hidden',
},

rowInner: {
  flex: 1,
  zIndex: 2,
},

ghostLetter: {
  position: 'absolute',
  right: -10,
  top: '50%',
  transform: [{ translateY: -40 }],
  fontSize: 120,
  fontWeight: '900',
  color: '#000',
  opacity: 0.05,
  letterSpacing: -4,
},


rightRule: {
  width: 2,
  backgroundColor: '#000',
  opacity: 0.12,
  borderRadius: 2,
},

disabledRow: {
  opacity: 0.4,
},

bigName: {
  fontSize: 42,
  fontWeight: '800',
  color: '#000',
  letterSpacing: 0.8,
  textTransform: 'uppercase',
},

metaRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 8,
},

line: {
  width: 40,
  height: 1,
  backgroundColor: '#000',
  marginRight: 10,
},

actionText: {
  fontSize: 13,
  fontWeight: '600',
  color: '#000',
  letterSpacing: 0.6,
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
    color: 'black',
  },
  tagline: {
    fontSize: 14,
    fontWeight: '500',
    color: 'black',
    marginVertical: 4,
  },
  enter: {
    fontSize: 14,
    fontWeight: '600',
    color: 'black',
    marginTop: 4,
  },
});

export default StoreLandingPage;
