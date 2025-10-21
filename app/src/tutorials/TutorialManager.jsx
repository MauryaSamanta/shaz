import React, { createContext, useContext, useState } from 'react';

const TutorialContext = createContext();

export const TutorialProvider = ({ children, onTutorialEnd }) => {
  const [tutorialActive, setTutorialActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tutorialType, setTutorialType] = useState(null); // 'swipe' or 'navigation'

  const startTutorial = (type = 'swipe') => {
    setTutorialType(type);
    setCurrentStep(0);
    setTutorialActive(true);
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const endTutorial = () => {
    setTutorialActive(false);
    setCurrentStep(0);
    setTutorialType(null);
     if (onTutorialEnd) onTutorialEnd();
  };

  return (
    <TutorialContext.Provider value={{
      tutorialActive,
      currentStep,
      setCurrentStep,
      tutorialType,
      startTutorial,
      nextStep,
      endTutorial
    }}>
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => useContext(TutorialContext);
