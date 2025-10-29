import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import HomeScreen from './src/screens/Home';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from './src/store';
import OnboardScreen from './src/screens/Onboard';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AuthScreen from './src/screens/GetStarted';
import LikedScreen from './src/screens/LikedScreen';
import PaymentScreen from './src/screens/Payment';
import HomeT from './src/tutorials/HomewithTutorial';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from './src/screens/SplashScreen';
import NetInfo from '@react-native-community/netinfo';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Linking, StatusBar } from 'react-native';

const Stack = createNativeStackNavigator();

const RootNavigator = ({ onLoadingChange, onNetworkChange }) => {
  const user = useSelector((state) => state.auth.user);
  const [initialRoute, setInitialRoute] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // Subscribe to network status
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected && state.isInternetReachable);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
  // Watch network changes
  const unsubscribe = NetInfo.addEventListener(state => {
    const connected = state.isConnected && state.isInternetReachable;
    setIsConnected(connected);
    onNetworkChange?.(connected);
  });

  return () => unsubscribe();
}, []);

useEffect(() => {
  onLoadingChange?.(isLoading);
}, [isLoading]);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await AsyncStorage.removeItem('hasShownDynamicIsland');

        // Keep splash for at least 2s
        const splashTimer = new Promise(resolve => setTimeout(resolve, 2000));

        const checkTutorialStatus = async () => {
          try {
            const completed = await AsyncStorage.getItem('tutorialCompleted');
            if (completed === 'true') {
              setInitialRoute(user ? 'Home' : 'Login');
            } else {
              setInitialRoute(user ? 'Tutorial' : 'Login');
            }
          } catch (error) {
            setInitialRoute('Tutorial');
          }
        };

        await Promise.all([splashTimer, checkTutorialStatus()]);
        setIsLoading(false);
      } catch (error) {
        console.error('Initialization error:', error);
        setInitialRoute('Tutorial');
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [user]);

  // If still loading OR no internet, keep splash up
  if (isLoading || !isConnected) {
    return <SplashScreen />;
  }

  if (!initialRoute) return null;

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={initialRoute}
    >
      <Stack.Screen name="Tutorial" component={HomeT} />
      <Stack.Screen name="Login" component={OnboardScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="Liked" component={LikedScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="Closet" component={HomeScreen} />

    </Stack.Navigator>
  );
};

const App = () => {
  const queryClient = new QueryClient();
  const [currentRoute, setCurrentRoute] = useState(null);
  const [appLoading, setAppLoading] = useState(true);
const [appConnected, setAppConnected] = useState(true);

const shouldHavePadding =
  !appLoading && appConnected &&
  currentRoute !== 'Home' &&
  currentRoute !== 'Login' &&
  currentRoute !== 'Liked' &&
  currentRoute !== 'Closet';
  
const linking = {
  prefixes: ['https://www.shazlo.store', 'shazlo://open'],
  config: {
    screens: {
      Tutorial: 'tutorial',
      Login: 'login',
      Home: '',
      Auth: 'auth',
      Liked: 'liked',
      Payment: 'payment',
       Closet: 'closet/:id',
    },
  },
  async getInitialURL() {
    // Handle case when app was closed and opened by a link
    const url = await Linking.getInitialURL();
    return url;
  },
  subscribe(listener) {
    // Listen to incoming deep links while app is running
    const onReceiveURL = ({ url }) => listener(url);
    const subscription = Linking.addEventListener('url', onReceiveURL);

    return () => subscription.remove();
  },
};

const [initialState, setInitialState] = useState();

useEffect(() => {
  const prepare = async () => {
    const url = await Linking.getInitialURL();
    if (url) {
      const state = await linking.getStateFromPath?.(url, linking.config);
      if (state?.routes?.length === 1) {
        // If app started directly from deep link → add Home as base
        setInitialState({
          routes: [
            { name: 'Home' },       // base screen
            ...state.routes,        // deep link target
          ],
        });
      } else {
        setInitialState(state);
      }
    }
  };
  prepare();
}, []);
  return (
     <SafeAreaProvider style={{ flex: 1, backgroundColor: '#fff',paddingTop: shouldHavePadding ? 30 : 0 }}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <NavigationContainer 
                linking={linking}
                  initialState={initialState}
                onStateChange={(state) => {
                  const route = state?.routes[state.index];
                  setCurrentRoute(route?.name);
                }}>
                <RootNavigator   onLoadingChange={setAppLoading}
  onNetworkChange={setAppConnected}/>
              </NavigationContainer>
            </PersistGate>
          </Provider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

export default App;
