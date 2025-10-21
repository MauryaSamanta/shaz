import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { setlogout } from '../store/authSlice';
import AuthScreen from './GetStarted';
import AuthScreenProfile from './AuthScreenProfile';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resetCart } from '../store/cartSlice';

const ProfileScreen = () => {
  const user=useSelector((state)=>state.auth.user)
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



  const ListItem = ({ title, text, pink = false }) => (
  <TouchableOpacity style={styles.listItem}>
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
        <SectionButton title="Orders"/>
        <SectionButton title="Liked" onPress={()=>navigation.navigate('Liked')}/>
       
      </View>



      <Text style={styles.sectionHeader}>ACCOUNT</Text>
      <ListItem title="Address" text="Address"/>
      
      {/* <ListItem title="My Coupons" /> */}

      <Text style={styles.sectionHeader}>FEEDBACK & HELP</Text>
      <ListItem title="RateApp" text="Rate App"/>
      <ListItem title="ReportAppissue" text="Report App issue"/>
      <ListItem title="HelpDesk" text="Help Desk"/>

      <Text style={styles.sectionHeader}>MORE</Text>
      <ListItem title="About" text="About us" />
      <ListItem title="Terms" text="Terms & Conditions"/>
      <ListItem title="Privacy" text="Privacy Policy"/>
      <ListItem title="Refund" text="Refund Policy"/>
     

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>

      <Image source={require('../assets/images/main-logo.png')} style={styles.footerText}/>
      </>):(<AuthScreenProfile/>)}
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
}

});

export default ProfileScreen;
