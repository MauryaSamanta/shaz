import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';
import { useSelector } from 'react-redux';

async function requestUserPermission(user) {
    // await AsyncStorage.removeItem('FCMToken1');
    // await AsyncStorage.removeItem('FCMToken');
    // await AsyncStorage.removeItem('fcmToken');

  try {
    // ✅ Check current permission status
    const currentStatus = await messaging().hasPermission();

    let authStatus = currentStatus;
    if (
      currentStatus !== messaging.AuthorizationStatus.AUTHORIZED &&
      currentStatus !== messaging.AuthorizationStatus.PROVISIONAL
    ) {
      // 🔔 Ask permission if not already granted
      authStatus = await messaging().requestPermission();
    }

    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('✅ Notification permission granted');
      await getAndStoreFCMToken(user);
    } else {
      console.log('❌ Notification permission denied');
      if (Platform.OS === 'android') {
        Alert.alert(
          'Notifications Disabled',
          'Please enable notifications in system settings to receive updates.'
        );
      }
    }
  } catch (error) {
    console.log('Error requesting permission:', error);
  }
}

async function getAndStoreFCMToken(user) {
  try {
    // 🔁 Check if we already have a token saved locally
    let fcmToken = await AsyncStorage.getItem('FCMToken1');
    // console.log(fcmToken)
    if (!fcmToken) {
      fcmToken = await messaging().getToken();
      if (fcmToken) {
        console.log('📱 New FCM Token:', fcmToken);
        await AsyncStorage.setItem('FCMToken1', fcmToken);
        // 👇 Send token to your backend API
        await registerTokenWithBackend(fcmToken,user);
      }
    } else {
      console.log('🔄 Existing FCM Token:', fcmToken);
      // still verify it (tokens may rotate)
      const newToken = await messaging().getToken();
      if (newToken !== fcmToken) {
        console.log('🔁 Token refreshed:', newToken);
        await AsyncStorage.setItem('FCMToken1', newToken);
        await registerTokenWithBackend(newToken,user);
      }
    }
  } catch (error) {
    console.log('Error getting FCM token:', error);
  }
}

// 📡 Send the token to your backend
async function registerTokenWithBackend(token,user) {
  try {
    // const user = useSelector((state)=>state.auth.user);
    if (!user) return; // user not logged in yet

    const user_id = user?.user_id;
    if (!user_id) return;

    await fetch('https://shaz-dsdo.onrender.com/v1/user/register_fcm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, token }),
    });
    console.log('✅ Token registered with backend');
  } catch (err) {
    console.log('Error sending token to backend:', err);
  }
}

export default requestUserPermission;
