import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
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
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useSelector } from 'react-redux';
import AddressList from '../components/AddressList';
import { useCart, useAddToCart, useRemoveFromCart } from '../QueryHooks/Cart';
import ComingSoonModal from '../components/ComingSoonModal';
// import { useCart, useAddToCart, useRemoveFromCart} from "../QueryHooks/Cart"
const CartScreen = () => {
  const user = useSelector((state) => state.auth.user);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setpaying]=useState(false);
  const [step, setStep] = useState('cart'); // cart → address → (checkout triggered)
  const [addresses,setaddresses]=useState([]);
  const [addingnewadd,setaddingnewadd]=useState(false);
  const [selectedAddress,setSelectedAddress]=useState(null);
const [address, setAddress] = useState({
  address_line: '',
  landmark: '',
  city: '',
  state: '',
  pincode: ''
});

const [showcomingsoon,setshowcomingsoon]=useState(false);

//  const { data, isLoading, error } = useCart(user.user_id);
//  useEffect(() => {
  
//   if (data) {
//     setCartItems(data);
//     setLoading(false)
//   }
// }, [data]);
  const getCart = async () => {
    const response = await fetch(`https://shaz-dsdo.onrender.com/v1/cart/${user.user_id}/`);
    const returnedData = await response.json();
    const itemsWithQty = returnedData.items.map((item) => ({ ...item, quantity: 1 }));
    setCartItems(itemsWithQty);
    console.log(cartItems)
    setLoading(false);
  };

  const getAddresses = async () => {
    const response = await fetch(`https://shaz-dsdo.onrender.com/v1/address/${user.user_id}/`);
    const returnedData = await response.json();
    if(returnedData.addresses.length>0)
      setaddingnewadd(false);
    else
      setaddingnewadd(true);
    // console.log(returnedData)
    setaddresses(returnedData.addresses);

  };

  const removeItem = async (item_id) => {
    setCartItems((prev) => prev.filter((item) => item.item_id !== item_id));
    removeFromCart.mutate(item_id);
  };

  const increaseQty = (item_id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.item_id === item_id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQty = (item_id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.item_id === item_id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };
  const navigation=useNavigation();
  const handleCheckout=async()=>{ 
    if(!user?.name)
      {navigation.navigate("Auth");
      return;}
    if(step==="cart")
      {setStep("address") 
        return;}
        if(step==="address")
        {   try {
      if (addingnewadd) {
        const body = {
          user_id: user.user_id,
          address_line: address.address_line,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          landmark: address.landmark,
        };

        console.log("Sending address:", body);

        const addressRes = await fetch('https://shaz-dsdo.onrender.com/v1/address/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!addressRes.ok) {
          throw new Error(`Address creation failed: ${addressRes.status}`);
        }

        const addressData = await addressRes.json();
        console.log("Address created:", addressData);

        setSelectedAddress(addressData);
      }
      if(selectedAddress)
      setStep("payment");
    else
      return;
    } catch (err) {
      console.error("Error creating address:", err);
      // optional: showToast or alert
    } 
          if(selectedAddress)
          {setStep("payment");}
          else
            return;
           setpaying(false);
           
        }
    setpaying(true);
    const totalAmount = cartItems.reduce((total, item) => {
      const cleaned = item.price.replace(/[₹,]/g, '').trim();
      const price = parseFloat(cleaned);
      return total + (isNaN(price) ? 0 : price * item.quantity);
    }, 0);

    const orderRes = await fetch('https://shaz-dsdo.onrender.com/v1/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Math.round(totalAmount * 100) }), // amount in paise
    });
    const { order_id, amount, razorpay_key_id } = await orderRes.json();

    // Navigate to payment screen
    navigation.navigate('Payment', {
      order_id,
      amount,
      razorpay_key_id,
      cartItems:cartItems,
      address:selectedAddress,

    });
    setpaying(false)
  }

  useEffect(() => {
    getCart();
    getAddresses();
  }, [])
  console.log(cartItems)
    const removeFromCart = useRemoveFromCart(user.user_id);
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: `https://shaz-dsdo.onrender.com/v1/items/getimage?url=${encodeURIComponent(item.image_url)}` }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title}>
          {item.store}
        </Text>
        <Text style={styles.brand}>{item.title.split('-')[0].length > 16
          ? item.title.split('-')[0].slice(0, 16) + '...'
          : item.title.split('-')[0]}</Text>
        <Text style={styles.price}>{item.price}</Text>

        <View style={styles.quantityContainer}>
          <TouchableOpacity onPress={() => decreaseQty(item.item_id)} style={styles.qtyBtn}>
            <Text style={styles.qtyText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.qtyCount}>{item.quantity}</Text>
          <TouchableOpacity onPress={() => increaseQty(item.item_id)} style={styles.qtyBtn}>
            <Text style={styles.qtyText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => removeItem(item.item_id)} style={styles.trashBtn}>
          <Text style={styles.trashIcon}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>My Bag</Text>
      <View style={styles.progressBar}>
  <View style={[styles.stepCircle, step === 'cart' && styles.stepActive]}><Image
      source={step === 'cart'
        ? require('../assets/images/shopping-cart-filled.png')
        : require('../assets/images/shopping-cart.png')
      }
      style={{ width: 20, height: 20 }}
    /></View>
  <View
  style={[
    styles.stepLine,
    { backgroundColor: step === 'address' || step === 'payment' ? 'green' : '#ccc' },
  ]}
/>
  <View style={[styles.stepCircle, step === 'address' && styles.stepActive]}><Image
      source={step === 'address'
        ? require('../assets/images/home-filled.png')
        : require('../assets/images/home.png')
      }
      style={{ width: 20, height: 20 }}
    /></View>
    <View
  style={[
    styles.stepLine,
    { backgroundColor:  step === 'payment' ? 'green' : '#ccc' },
  ]}
/>
  <View style={[styles.stepCircle, step === 'payment' && styles.stepActive]}><Image
      source={step === 'payment'
        ? require('../assets/images/credit-card-filled.png')
        : require('../assets/images/credit-card.png')
      }
      style={{ width: 20, height: 20 }}
    /></View>
</View>

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
      ) : step==="cart"?(
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.item_id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ):( <View style={styles.addressForm}>
        <View style={[{diplay:'flex', flexDirection:'row', justifyContent:'space-between'}]}>
  <Text style={styles.inputLabel}>{!addingnewadd?"Select Address":"Add Address"}</Text>
  {!selectedAddress&&(<TouchableWithoutFeedback onPress={() => {setaddingnewadd(!addingnewadd) }}>
            <View style={styles.addressButton}>

              <Text style={styles.checkoutText}>{!addingnewadd?"Add Address":"Back"}</Text>
            </View>
          </TouchableWithoutFeedback>)}
    </View>
  {addingnewadd?(<>
  <TextInput
    style={styles.inputBox}
    placeholder="e.g. Flat no, Street, Area"
    placeholderTextColor="grey"
    value={address.address_line}
    onChangeText={(text) => setAddress({ ...address, address_line: text })}
  />

  <Text style={styles.inputLabel}>Landmark</Text>
  <TextInput
    style={styles.inputBox}
    placeholder="e.g. Near Axis Bank"
     placeholderTextColor="grey"
    value={address.landmark}
    onChangeText={(text) => setAddress({ ...address, landmark: text })}
  />

  <Text style={styles.inputLabel}>City</Text>
  <TextInput
    style={styles.inputBox}
    placeholder="e.g. Mumbai"
     placeholderTextColor="grey"
    value={address.city}
    onChangeText={(text) => setAddress({ ...address, city: text })}
  />

  <Text style={styles.inputLabel}>State</Text>
  <TextInput
    style={styles.inputBox}
    placeholder="e.g. Maharashtra"
     placeholderTextColor="grey"
    value={address.state}
    onChangeText={(text) => setAddress({ ...address, state: text })}
  />

  <Text style={styles.inputLabel}>Pincode</Text>
  <TextInput
    style={styles.inputBox}
    placeholder="e.g. 400001"
     placeholderTextColor="grey"
    keyboardType="numeric"
    value={address.pincode}
    onChangeText={(text) => setAddress({ ...address, pincode: text })}
  />
  </>):(
    <AddressList addressList={addresses} setSelectedAddress={setSelectedAddress}/>
  )}
</View>
)}
      {!loading && cartItems.length > 0 ? (
        <>
          <View style={styles.subtotalContainer}>
            <Text style={styles.subtotalLabel}>Total:</Text>
            <Text style={styles.subtotalValue}>
              ₹{' '}
              {cartItems
                .reduce((total, item) => {
                  const cleaned = item.price.replace(/[₹,]/g, '').trim(); // remove ₹ and commas
                  const price = parseFloat(cleaned);
                  return total + (isNaN(price) ? 0 : price * item.quantity);
                }, 0)
                .toFixed(2)}
            </Text>

          </View>
          <TouchableWithoutFeedback onPress={() => {
            // handleCheckout() 
            setshowcomingsoon(true)
            }}>
            <View style={styles.checkoutButton}>

              {!paying?(<Text style={styles.checkoutText}>
                {/* {user?.name?step==="cart"?"Choose Address":step==="address"
              &&"Confirm and Pay":
              // "Set up your account to checkout"
              "Coming soon !!"
              } */}
              Coming Soon !!
              </Text>):(  <ActivityIndicator size="small" color="white" />)}
            </View>
          </TouchableWithoutFeedback>
          {showcomingsoon&&<ComingSoonModal visible={showcomingsoon} onClose={()=>{setshowcomingsoon(false)}}/>}
        </>
      ) : !loading && cartItems.length === 0 && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 300 }}>
          <Image source={require('../assets/images/shopping-bag.png')} style={{ width: 150, height: 150, marginBottom: 20 }} />
          <Text style={{ fontSize: 18, color: 'black', marginBottom: 8 }}>Empty Bag Alert!</Text>
          <Text style={{ fontSize: 15, color: '#888' }}>Fill it with fashionable items from over 30+ brands</Text>
        </View>
      )}

    </SafeAreaView>
  );
};

export default CartScreen;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'whitesmoke',
    width: width,
    paddingBottom:70,
    // paddingTop:50
    
  },
  header: {
    fontSize: 35,
    fontFamily: 'STIXTwoTextBold',
    textAlign: 'center',
    backgroundColor: 'white',
    // marginVertical: 10,
    paddingTop: 50,
    color: 'black',
  },
  progressBar: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical:10,
  marginBottom:10,
  // marginVertical: 10,
  backgroundColor:'white'
},
stepCircle: {
  width: 30,
  height: 30,
  borderRadius: 15,
  // backgroundColor: '#ccc',
  justifyContent: 'center',
  alignItems: 'center',
},
stepActive: {
  // backgroundColor: '#000',
},
stepText: {
  fontSize: 16,
},
stepLine: {
  width: 100,
  height: 2,
 
  marginHorizontal: 4,
},
addressForm: {
  padding: 20,
},
inputLabel: {
  fontSize: 14,
  color: '#555',
  marginBottom: 6,
  marginTop: 12,
},
inputBox: {
  backgroundColor: 'white',
  padding: 12,
  borderRadius: 10,
  fontSize: 16,
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
  backgroundColor: 'black',
  paddingVertical: 10,
  paddingHorizontal: 16,
  borderRadius: 10,
  marginLeft: 20,
  marginRight: 20,
  alignItems: 'center',

  // Shadow for iOS
  shadowColor: '#000',
  shadowOffset: { width: 0, height: -3 }, // Negative height = shadow on top
  shadowOpacity: 0.2,
  shadowRadius: 4,

  // Elevation for Android (not directional, so simulate with a wrapper if needed)
  elevation: 5, // This applies all-around shadow on Android
},
 addressButton: {
  backgroundColor: 'black',
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 10,
  marginLeft: 20,
  marginBottom:10,
  // marginRight: 20,
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
    fontSize: 14,
    fontWeight: '600',
  },

});
