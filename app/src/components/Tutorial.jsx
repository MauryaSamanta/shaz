// components/TutorialOverlay.js

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';

const tutorialSteps = [
  "Swipe right to like, left to skip",
  "Tap the brand name to filter by brand",
  "Click Explore to discover more styles",
];

export default function TutorialOverlay({ onFinish }) {
  const [showTutorial, setShowTutorial] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem('tutorialSeen').then(value => {
      if (!value) {
        setShowTutorial(true);
      } else {
        onFinish(); // immediately notify parent if already seen
      }
    });
  }, []);

  const nextStep = async () => {
    if (step < tutorialSteps.length - 1) {
      setStep(step + 1);
    } else {
      setShowTutorial(false);
      await AsyncStorage.setItem('tutorialSeen', 'true');
      onFinish(); // notify SwipeUI that tutorial is done
    }
  };

  if (!showTutorial) return null;

  return (
    <Modal isVisible={true} backdropOpacity={0.45}>
      <View style={{
        backgroundColor: '#1e1e2e',
        padding: 25,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Text style={{
          color: 'white',
          fontSize: 20,
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: 20,
          fontFamily: 'STIXTwoTextBold',
        }}>
          {tutorialSteps[step]}
        </Text>

        <TouchableOpacity
          onPress={nextStep}
          style={{
            backgroundColor: 'white',
            paddingHorizontal: 25,
            paddingVertical: 10,
            borderRadius: 8,
          }}>
          <Text style={{ color: '#000', fontWeight: 'bold' }}>
            {step === tutorialSteps.length - 1 ? "Got it!" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
