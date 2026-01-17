import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  TouchableWithoutFeedback,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import ProductCard from '../components/Productcard';
import { finishCartUpdate, setCartCount, startCartUpdate } from '../store/cartSlice';
import { API_BASE_URL, getImageUrl } from '../config/api';

const LikedScreen = () => {
    const lastPart=useRef();
     const navigation = useNavigation();
      const {count:cartCount, isUpdating}=useSelector((state)=>state.cart)
    useEffect(() => {
  const onBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.replace('Home'); // 👈 fallback route when opened from deep link
    }
    return true;
  };

  const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
  return () => backHandler.remove();
}, [navigation]);
  const user = useSelector((state) => state.auth.user);
  const [likedItems, setlikedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page,setpage]=useState(1);
  const [showprod,setshowprod]=useState(null)
  const [addingItemId, setAddingItemId] = useState(null);
const [addedItemId, setAddedItemId] = useState(null);

  const getCart = async () => {
    try {
           const response = await fetch(`${API_BASE_URL}/v1/liked-items/${user.user_id}/?page=${page}`,{method:"GET"});
    const returnedData = await response.json();
    
    console.log(returnedData)
 const itemsWithQty = returnedData.map((item) => ({ ...item, quantity: 1 }));
    setlikedItems(itemsWithQty);
    console.log(likedItems)
    setLoading(false);
    } catch (error) {
        console.log(error)
    }
 
   
  };
const dispatch=useDispatch();
 const handleAddToCart = async (item) => {
  try {
    const selectedId = item.item_id;
    setAddingItemId(selectedId);

    dispatch(startCartUpdate());

    const data = {
      user_id: user.user_id,
      item_id: selectedId,
    };

    const response = await fetch(
      `${API_BASE_URL}/v1/cart/add/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

    if (response.ok) {
      dispatch(setCartCount(cartCount + 1));
      setAddedItemId(selectedId);

      // reset “Added” after 1.5s
      setTimeout(() => {
        setAddedItemId(null);
      }, 1500);
    }
  } catch (error) {
    console.log("⚠️ Error adding to cart:", error);
  } finally {
    setAddingItemId(null);
    dispatch(finishCartUpdate());
  }
};


  useEffect(() => {
    getCart()
  }, [page])
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableWithoutFeedback onPress={()=>{setshowprod(item); }}>
      <Image source={{ uri: `${API_BASE_URL}/v1/items/getimage?url=${encodeURIComponent(item.image_url)}` }} style={styles.image} />
      </TouchableWithoutFeedback>
      <View style={styles.info}>
        <Text style={styles.title}>
          {item.store}
        </Text>
        <Text style={styles.brand}>{item.title.split('-')[0].length > 16
          ? item.title.split('-')[0].slice(0, 16) + '...'
          : item.title.split('-')[0]}</Text>
        <Text style={styles.price}>{item.price}</Text>

         <TouchableWithoutFeedback
  disabled={addingItemId === item.item_id}
  onPress={() => handleAddToCart(item)}
>
  <View style={styles.checkoutButton}>
    {addingItemId === item.item_id ? (
      <ActivityIndicator color="white" size="small" />
    ) : addedItemId === item.item_id ? (
      <Text style={styles.checkoutText}>Added ✓</Text>
    ) : (
      <Text style={styles.checkoutText}>Add to Bag</Text>
    )}
  </View>
</TouchableWithoutFeedback>

      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
       
      <Text style={styles.header}>My Liked Stuff</Text>
       
      {loading ? (
        Array(3)
          .fill(0)
          .map((_, index) => (
            <View key={index} style={styles.card}>
              <View style={[styles.image, { backgroundColor: '#e0e0e0' }]} />
              <View style={styles.info}>
                <View
                  style={{
                    width: 100,
                    height: 18,
                    backgroundColor: '#e0e0e0',
                    borderRadius: 4,
                    marginBottom: 8,
                  }}
                />
                <View
                  style={{
                    width: 80,
                    height: 14,
                    backgroundColor: '#e0e0e0',
                    borderRadius: 4,
                    marginBottom: 8,
                  }}
                />
                <View
                  style={{
                    width: 60,
                    height: 14,
                    backgroundColor: '#e0e0e0',
                    borderRadius: 4,
                  }}
                />
              </View>
            </View>
          ))
      ) : (
        <FlatList
          data={likedItems}
          keyExtractor={(item) => item.item_id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
      <View ref={lastPart}>

      </View>
      { !loading && likedItems.length === 0 && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 300 }}>
          <Image source={require('../assets/images/shopping-bag.png')} style={{ width: 150, height: 150, marginBottom: 20 }} />
          <Text style={{ fontSize: 18, color: 'black', marginBottom: 8 }}>Empty Cart Alert!</Text>
          <Text style={{ fontSize: 15, color: '#888' }}>Fill it with fashionable items from over 30+ brands</Text>
        </View>
      )}
      {showprod&&(<ProductCard item={showprod} visible={!!showprod} onClose={() => setshowprod(null)}/> )}

    </SafeAreaView>
  );
};

export default LikedScreen;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'whitesmoke',
    width: width,
    paddingHorizontal:16,
    paddingTop:46
  },
  header: {
    fontSize: 35,
    fontFamily: 'STIXTwoTextBold',
    textAlign: 'center',
    // backgroundColor: 'white',
    // marginVertical: 10,
    paddingBottom:16,
    color: 'black',
  },
  listContent: {
    paddingBottom: 0,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    width:'100%',
    borderRadius: 14,
    // marginHorizontal: 16,
    //  marginVertical: 10,
    padding: 14,
     marginBottom: 10,

  },
  logoInsideBar: {
  width: 50,
  height: 50,
  marginRight: 8,
  borderRadius: 4,
},
  image: {
    width: 130,
    height: 190,
    borderRadius: 14,
  },
  info: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
    position: 'relative',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: 'black',
    numberOfLines: 1,
    textTransform: 'capitalize',
    // fontFamily: 'STIXTwoTextBold',
  },
  brand: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    color: '#333',
    marginTop: 6,
    marginBottom:12,
    fontWeight: '500',
  },
  trashBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 6,
  },
  trashIcon: {
    fontSize: 14,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#eee',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  qtyBtn: {
    paddingHorizontal: 8,
  },
  qtyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  qtyCount: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 12,
    color: '#000',
  },
  subtotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    // backgroundColor: '#fff',
    // borderTopWidth: 1,
    // borderColor: '#ddd',
    width: '100%',
    // marginBottom: 0, 
  },
  subtotalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  subtotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: 'black',
  },
  checkoutButton: {
    position:'absolute',
    bottom:0,
  backgroundColor: 'black',
  paddingVertical: 5,
   width:'60%',
  paddingHorizontal: 5,
  borderRadius: 10,
//   marginLeft: 20,
//   marginRight: 20,
   alignItems: 'center',

  // Shadow for iOS
  shadowColor: '#000',
  shadowOffset: { width: 0, height: -3 }, // Negative height = shadow on top
  shadowOpacity: 0.2,
  shadowRadius: 4,

  // Elevation for Android (not directional, so simulate with a wrapper if needed)
  elevation: 5, // This applies all-around shadow on Android
},


  checkoutText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
  },

});
