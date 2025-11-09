import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, BackHandler, Animated, Dimensions, Easing, Keyboard } from 'react-native';
import TabBar from '../components/TabBar';
import MixesScreen from './Mixes';
import SwipeUI from './SwipeUI';
import { ScrollView } from 'react-native-gesture-handler';
import ScrollableDemoScreen from './Scroll';
import TrendingScreen from './Trending';
import MoodBoardsScreen from './Closets';
import CartScreen from './CartScreen';
import StoreLandingPage from './Stores';
import ProfileScreen from './ProfileScreen';
import { TutorialContext } from '../tutorials/tutorialContext';
import { onTargetReady } from '../tutorials/tutorialTargets';
import SwipeUIWithTutorial from './SwipeUIT';
import { useSelector } from 'react-redux';
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useCart } from '../QueryHooks/Cart';
import CircularRevealWrapper from '../utils/ScreenAnim2';
import AsyncStorage from '@react-native-async-storage/async-storage';
type ScreenName = 'Home' | 'Campus' |'Swipe'| 'List' | 'Explore' | 'Cart' | 'Profile';
const HomeScreen = () => {
    const [activeScreen, setActiveScreen] = useState<ScreenName>('Home');
    const [selectedBrand, setSelectedBrand] = useState<String>('');
    
  const screenHistoryRef = useRef<ScreenName[]>([]);
  const user=useSelector((state:any)=>state.auth.user);
const handleScreenChange = (newScreen: ScreenName) => {
  if (newScreen !== activeScreen) {
    screenHistoryRef.current.push(activeScreen);
    setActiveScreen(newScreen);
  }
};

const [isKeyboardVisible, setKeyboardVisible] = useState(false);

useEffect(() => {
  const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
    setKeyboardVisible(true);
  });

  const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
    setKeyboardVisible(false);
  });

  return () => {
    keyboardDidShowListener.remove();
    keyboardDidHideListener.remove();
  };
}, []);
useEffect(() => {
  const onBackPress = () => {
    if (screenHistoryRef.current.length > 0) {
      const previous = screenHistoryRef.current.pop();
      if (previous) setActiveScreen(previous);
      return true; // We handled it
    }
    return false; // Let system handle (exit app)
  };

  const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
  return () => backHandler.remove();
}, []);
type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  Closet:{id:String};
  // Add other routes as needed
};

const { width, height } = Dimensions.get("window");
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [activeScreen]);

  const radius = Math.hypot(width, height);

  const animatedStyle = {
    transform: [
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.1, 1],
        }),
      },
    ],
    borderRadius: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [width / 2, 0], // circle -> square
    }),
    opacity: anim,
  };

    // useEffect(()=>{
    //   getCart();
  
    // },[])
    // const getCart = async () => {
    //   const response = await fetch(`http://192.168.31.12:8000/v1/cart/${user.user_id}/`);
    //   const returnedData = await response.json();
    //   const itemsWithQty = returnedData.items.map((item:any) => ({ ...item, quantity: 1 }));
    //   await AsyncStorage.setItem('cartSize', itemsWithQty.length);
    // };

   
    // console.log(cartItems)

    const route = useRoute<RouteProp<RootStackParamList, keyof RootStackParamList>>();

// when opened via deep link "closet/:id"
useEffect(() => {
  if (route.name === 'Closet' && route.params?.id) {
    const closetId = route.params.id;
    // console.log('🔥 Deep link closet ID:', closetId);

    // switch to Campus screen
    setActiveScreen('Campus');

    // // make your API call
    // fetch(`http://192.168.31.12:8000/v1/closets/add-collab`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ user_id: user.user_id, closet_id:closetId }),
    // }).then(res => res.json())
    //   .then(data => console.log('Closet added:', data))
    //   .catch(err => console.error(err));
  }
}, [route.params]);

 const [closets,setclosets]=useState([])
     const fetchClosets = async () => {
      try {
        const response = await fetch(
          `http://192.168.31.12:8000/v1/closets/${user.user_id}`,
          {
            method: 'GET',
          },
        );
        const data = await response.json();
        setclosets(data);
        // selectedIdsRef.current = []; // reset on open
        // forceRender((n) => n + 1);
      } catch (error) {
        console.log(error);
      }
    };
    useEffect(()=>{
      fetchClosets();
    },[])

  const renderScreen = () => {
   

    switch (activeScreen) {
      case 'List':
        return <StoreLandingPage onSelectBrand={(brand:String) => {
            console.log('Selected Brand:', brand);
            setSelectedBrand(brand);
            setActiveScreen('Explore');
          }}/>;
      case 'Home':
        return <SwipeUI key="home" brand={null} handleScreenChange={handleScreenChange} activeScreen={activeScreen} closets={closets} setclosets={setclosets}/>; 
        // return <SwipeUIWithTutorial/>
      case 'Cart':
        return <CartScreen/>;
      case 'Swipe':
        return <TrendingScreen/>;
      case 'Explore':
        return <SwipeUI key="explore" brand={selectedBrand} handleScreenChange={handleScreenChange} activeScreen={activeScreen} closets={closets} setclosets={setclosets}/>;
    
      case 'Campus':
        return <MoodBoardsScreen  setclosets={setclosets}/>;

      case 'Profile':
        return <ProfileScreen/>;
      default:
        return <Text style={styles.text}>🏠 Home Screen</Text>;
    }
  };
  return (
    
    <View style={styles.container}>
      <View
  style={[
    styles.content,
    activeScreen === 'Campus' && { paddingBottom: 70 }
  ]}
>
  {renderScreen()}
</View>
      {!isKeyboardVisible && (
  <TabBar activeScreen={activeScreen} handleScreenChange={handleScreenChange} />
)}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    //backgroundColor: '#323278',
    justifyContent: 'center',
    alignItems: 'center',
  },
   content: {
    flex: 1,
    // paddingBottom:70
  },
  text: {
    color: 'white',
    fontSize: 20,
  },
});

export default HomeScreen;
