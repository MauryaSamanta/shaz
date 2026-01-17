import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image, Linking, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { setlogout } from '../store/authSlice';
import AuthScreen from './GetStarted';
import AuthScreenProfile from './AuthScreenProfile';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resetCart } from '../store/cartSlice';
import { API_BASE_URL } from '../config/api';

const ProfileScreen = () => {
  const user=useSelector((state)=>state.auth.user)
  const [deleting, setDeleting] = React.useState(false);
  const imageMap = {
  Address: require('../assets/images/Address.png'),
  RateApp: require('../assets/images/star.png'),
  ReportAppissue: require('../assets/images/complain.png'),
  HelpDesk:require('../assets/images/help.png'),
  About:require('../assets/images/hi.png'),
  Terms:require('../assets/images/docs.png'),
  Privacy:require('../assets/images/docs.png'),
  Refund:require('../assets/images/docs.png'),
  Liked: require('../assets/images/loved.png'),
  Orders:require('../assets/images/orders.png')
  // Add all other titles/images used
};
const navigation=useNavigation();
const dispatch=useDispatch();

const handleLogout=async()=>{
  dispatch(setlogout());
   dispatch(resetCart());
  // await AsyncStorage.removeItem('tutorialSeen');
  navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    })
  );
  
  
}

const handleDeleteAccount = () => {
  Alert.alert(
    'Delete Account',
    'This will permanently delete your account and all personal data. This action cannot be undone.',
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: confirmDeleteAccount,
      },
    ],
    { cancelable: true }
  );
};
const confirmDeleteAccount = async () => {
   setDeleting(true);
  try {
    const response = await fetch(
      `${API_BASE_URL}/v1/auth/delete`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.user_id,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Delete failed');
    }

    // ✅ Clear Redux
    dispatch(setlogout());
    dispatch(resetCart());

    // ✅ Optional: clear local storage
    await AsyncStorage.clear();

    // ✅ Hard reset navigation
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      })
    );

  } catch (error) {
    Alert.alert(
      'Error',
      'Failed to delete account. Please try again.'
    );
  }
};




  const ListItem = ({ title, text, pink = false, onPress }) => (
  <TouchableOpacity style={styles.listItem} onPress={onPress}>
    <Image source={imageMap[title]} style={[{width:30, height:30}]}/>
    <Text style={styles.listTitle}>{text}</Text>
    
  </TouchableOpacity>
);
const SectionButton = ({ title, icon, subtitle, onPress }) => (
  <TouchableOpacity style={styles.sectionButton} onPress={onPress}>
     <Image source={imageMap[title]} style={[{width:30, height:30}]}/>
    <Text style={styles.sectionText}>{title}</Text>
    {subtitle && <Text style={styles.sectionSub}>{subtitle}</Text>}
  </TouchableOpacity>
);
  return (
    <ScrollView style={[styles.container,{padding:user?.name?20:0}]} contentContainerStyle={{ paddingBottom: 70 }}>
   {user?.name?(<>
       <Text style={[styles.title, { fontFamily: 'STIXTwoTextBold', fontSize: 28 , marginBottom:10}]}>
          Profile
        </Text>
      <View style={styles.header}>
        <Text style={styles.name}>{user?.name}</Text>
        {/* <Text style={styles.phone}>+918777838349</Text> */}
      
      </View>

      {/* Section: Orders / Wishlist / Profile */}
      <View style={styles.sectionRow}>
        {/* <SectionButton title="Orders"/> */}
        <SectionButton title="Liked" onPress={()=>navigation.navigate('Liked')}/>
       
      </View>



      {/* <Text style={styles.sectionHeader}>ACCOUNT</Text>
      <ListItem title="Address" text="Address"/> */}
      
      {/* <ListItem title="My Coupons" /> */}

      <Text style={styles.sectionHeader}>FEEDBACK & HELP</Text>
      {/* <ListItem title="RateApp" text="Rate App"/> */}
     <ListItem
  title="ReportAppissue"
  text="Give Your Feedback"
  onPress={() => {
    Linking.openURL('https://docs.google.com/forms/d/e/1FAIpQLSeAWT2uZseTZc2Nvp3RWsgDjG2Ja2gUjNxhWWtVZmimuUffdg/viewform?usp=header');
  }}
/>
      {/* <ListItem title="HelpDesk" text="Help Desk"/> */}

      <Text style={styles.sectionHeader}>MORE</Text>
      <ListItem title="About" text="About us" onPress={() => {
    Linking.openURL('https://www.shazlo.store');
  }}/>
      <ListItem
  title="Terms"
  text="Terms of Service"
  onPress={() => Linking.openURL('https://shazlo.store/terms-of-service')}
/>

<ListItem
  title="Privacy"
  text="Privacy Policy"
  onPress={() => Linking.openURL('https://shazlo.store/privacy')}
/>
      {/* <ListItem title="Refund" text="Refund Policy"/> */}
     

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleDeleteAccount}>
        <Text style={styles.logoutText}>Delete Account</Text>
      </TouchableOpacity>

      <Image source={require('../assets/images/shazlo-logo-v4.png')} style={styles.footerText}/>
      </>):(<AuthScreenProfile/>)}

      {deleting && (
  <View style={styles.loadingOverlay}>
    <ActivityIndicator size="large" color="#fff" />
    <Text style={styles.loadingText}>Deleting account…</Text>
  </View>
)}
    </ScrollView>
  );
};




const {width,height}=Dimensions.get('window')
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    // padding: 20,
    width:width,
    paddingTop:50
  },
  header: {
    padding: 20,
    alignItems: 'flex-start',
    // borderWidth: 0.5,
    borderColor: '#ccc',
    backgroundColor:'whitesmoke',
    borderRadius:10
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  },
  phone: {
    color: '#666',
    marginTop: 4,
  },
  completionContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    width: 40,
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 6,
  },
  progressFill: {
    width: '60%',
    height: '100%',
    backgroundColor: '#FFB800',
  },
  completionText: {
    fontSize: 12,
    color: '#666',
  },
  sectionRow: {
     flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 18,
    gap:10
  },
  sectionButton: {
    display:'flex',
    flexDirection:'row',
    backgroundColor:'whitesmoke',
    // marginLeft:10,
    padding:10,
    borderRadius:10,
    alignItems: 'center',
    flex: 1,
  },
  sectionText: {
     fontSize: 17,
    marginLeft:20
  },
  sectionSub: {
    fontSize: 12,
    color: '#FFB800',
    marginTop: 2,
  },
  listItem: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 0.7,
    backgroundColor:'white',
    borderColor: '#ddd',
    borderRadius:10
  },
  listTitle: {
    fontSize: 17,
    marginLeft:20
  },
  badge: {
    backgroundColor: '#FFB800',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  pinkBadge: {
    backgroundColor: '#FFD8DD',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 10,
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  logoutButton: {
    marginTop: 30,
    borderWidth: 1,
    borderColor: 'red',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: 'red',
    fontWeight: '600',
  },
  footerText: {
  //  marginTop: -20,
  width: 130,
  height: 130,
 alignSelf: 'center',
  resizeMode: 'contain',
},
loadingOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.6)',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 999,
},
loadingText: {
  marginTop: 12,
  color: '#fff',
  fontSize: 16,
  fontWeight: '600',
},

});

export default ProfileScreen;
