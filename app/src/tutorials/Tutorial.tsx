import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, BackHandler } from 'react-native';
import TabBar from '../components/TabBar';

import SwipeUI from '../screens/SwipeUI';
import { ScrollView } from 'react-native-gesture-handler';


import MoodBoardsScreen from '../screens/Closets';
import CartScreen from '../screens/CartScreen';
import StoreLandingPage from '../screens/Stores';
import ProfileScreen from '../screens/ProfileScreen';
import { TutorialContext } from './tutorialContext';
import { onTargetReady } from './tutorialTargets';
import TrendingScreen from '../screens/Trending';

type ScreenName = 'Home' | 'Campus' |'Swipe'| 'List' | 'Explore' | 'Cart' | 'Profile';
const Tutorial = () => {
    const [activeScreen, setActiveScreen] = useState<ScreenName>('Home');
    const [selectedBrand, setSelectedBrand] = useState<String>('');
  const screenHistoryRef = useRef<ScreenName[]>([]);

const handleScreenChange = (newScreen: ScreenName) => {
  if (newScreen !== activeScreen) {
    screenHistoryRef.current.push(activeScreen);
    setActiveScreen(newScreen);
  }
};

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


    
  const renderScreen = () => {
    switch (activeScreen) {
      case 'List':
        return <StoreLandingPage onSelectBrand={(brand:String) => {
            console.log('Selected Brand:', brand);
            setSelectedBrand(brand);
            setActiveScreen('Explore');
          }}/>;
      case 'Home':
        return <SwipeUI key="home" brand={null} handleScreenChange={handleScreenChange} />; 
        // return <SwipeUIWithTutorial/>
      case 'Cart':
        return <CartScreen/>;
      case 'Swipe':
        return <TrendingScreen/>;
      case 'Explore':
        return <SwipeUI key="explore" brand={selectedBrand} handleScreenChange={handleScreenChange} />;
    
      case 'Campus':
        return <MoodBoardsScreen/>;

      case 'Profile':
        return <ProfileScreen/>;
      default:
        return <Text style={styles.text}>🏠 Home Screen</Text>;
    }
  };
  return (
    
    <View style={styles.container}>
       <View style={styles.content}>
      {renderScreen()}
    </View>
      <TabBar activeScreen={activeScreen} handleScreenChange={handleScreenChange}/>
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
    paddingBottom:70
  },
  text: {
    color: 'white',
    fontSize: 20,
  },
});

export default Tutorial;
