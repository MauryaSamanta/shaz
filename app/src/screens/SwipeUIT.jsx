import React, { useEffect } from 'react';
import { TutorialProvider, useTutorial } from "../tutorials/TutorialManager";
import TutorialOverlay from '../tutorials/tutorialOverlay';
import SwipeUI from "./SwipeUI";

// Inner component that uses the tutorial hook
const SwipeUIWithTutorialLogic = () => {
  const { startTutorial } = useTutorial(); // Now this works because it's inside the provider

  useEffect(() => {
    // Check if user is new or wants tutorial
    const isFirstTime = true; // Check from AsyncStorage
    if (isFirstTime) {
      setTimeout(() => startTutorial('swipe'), 1000);
    }
  }, []);

  return <SwipeUI />;
};

// Main wrapper component that provides the context
export default function SwipeUIWithTutorial() {
  return (
    <TutorialProvider>
      <TutorialOverlay>
        <SwipeUIWithTutorialLogic />
      </TutorialOverlay>
    </TutorialProvider>
  );
}