import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSelector } from 'react-redux';
// import axios from 'axios';

const PaymentScreen = ({ route, navigation }) => {
  const { order_id, amount, razorpay_key_id, cartItems, address } = route.params;
  console.log(cartItems,address);
  const user=useSelector((state)=>state.auth.user);
  const handleWebViewMessage = async (event) => {
    console.log(event)
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log(data)
      const response = await fetch('http://192.168.31.12:8000/v1/verify-payment/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    razorpay_order_id: data.razorpay_order_id,
    razorpay_payment_id: data.razorpay_payment_id,
    razorpay_signature: data.razorpay_signature,
  }),
});

const res = await response.json();
console.log(res)
        if (res.status === 'success') {
      // Extract required order data
      const orderPayload = {
        user_id: user.user_id,
        name: user.name,
        items: cartItems.map(item => item.id),  // Assuming item object has an `id` field
        total_amount: amount / 100,  // Converting back from paise to rupees
        address: {
          address_line: address.address_line,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          landmark: address.landmark
        }
      };

      // Create order in DB
      const orderDbRes = await fetch('http://192.168.31.12:8000/v1/order-db/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const orderDbJson = await orderDbRes.json();
      console.log("Order DB response:", orderDbJson);

      if (orderDbRes.ok) {
        Alert.alert("Success", "Order placed successfully!");
        navigation.goBack();  // or redirect to success page
      } else {
        Alert.alert("Order Error", "Payment succeeded but order creation failed");
      }
    } else {
      Alert.alert("Failure", "Payment verification failed");
    }
  } catch (error) {
    console.error("Payment error:", error);
    Alert.alert("Error", "Something went wrong during payment process");
  }
   
  };

  const checkoutUrl = `http://192.168.31.12:8000/v1/razorpay-checkout/?key=${razorpay_key_id}&amount=${amount}&order_id=${order_id}&name=${user?.name}&mno=${user?.phone_number}`;

  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{ uri: checkoutUrl }}
        onMessage={handleWebViewMessage}
      />
    </View>
  );
};

export default PaymentScreen;
