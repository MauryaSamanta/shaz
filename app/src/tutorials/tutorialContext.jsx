// tutorial/TutorialContext.js

import React, { createContext, useState } from 'react';

export const TutorialContext = createContext();

export const TutorialProvider = ({ children }) => {
  const [tutorialStep, setTutorialStep] = useState(0);
  const [tutorialActive, setTutorialActive] = useState(false);

  const startTutorial = () => {
    setTutorialStep(0);
    setTutorialActive(true);
  };

  const nextTutorialStep = () => {
    console.log('Next tutorial step:', tutorialStep);
    setTutorialStep((prev) => prev + 1);
  };

  const endTutorial = () => {
    setTutorialActive(false);
    setTutorialStep(0);
  };

  return (
    <TutorialContext.Provider value={{
      tutorialStep,
      tutorialActive,
      startTutorial,
      nextTutorialStep,
      endTutorial
    }}>
      {children}
    </TutorialContext.Provider>
  );
};
