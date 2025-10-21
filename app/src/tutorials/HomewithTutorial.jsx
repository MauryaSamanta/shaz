import React, { useEffect } from 'react';
import { TutorialProvider, useTutorial } from './TutorialManager';
import HomeScreen from '../screens/Home';
import TutorialOverlay from './tutorialOverlay';
import { CommonActions, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';


// Inner component that uses the tutorial hook
const HomeWithTutorial = () => {
  const { startTutorial } = useTutorial(); // Now this works because it's inside the provider

  useEffect(() => {
    // Check if user is new or wants tutorial
    const isFirstTime = true; // Check from AsyncStorage
    if (isFirstTime) {
      setTimeout(() => startTutorial('swipe'), 1000);
    }
  }, []);

  return <HomeScreen />;
};

// Main wrapper component that provides the context
export default function HomeT() {
    const navigation=useNavigation()
  return (
    <TutorialProvider  onTutorialEnd={async() => {
        
        await AsyncStorage.setItem('tutorialCompleted', 'true');
         navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            })
          );
          
      }}>
      <TutorialOverlay>
        <HomeWithTutorial />
      </TutorialOverlay>
    </TutorialProvider>
  );
}