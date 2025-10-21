import React, { useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
//import LinearGradient from 'react-native-linear-gradient';

const { height: screenHeight } = Dimensions.get('window');

const mixes = [
  { id: '1', name: 'Romantic Mix' },
  { id: '2', name: 'Breakup Mix' },
  { id: '3', name: 'Action Mix' },
  { id: '4', name: 'Sci-Fi Mix' },
  { id: '5', name: 'Horror Mix' },
  { id: '5', name: 'Horror Mix' },
  { id: '5', name: 'Horror Mix' },
  { id: '5', name: 'Horror Mix' },
  { id: '5', name: 'Horror Mix' },
  { id: '5', name: 'Horror Mix' },
  { id: '5', name: 'Horror Mix' },
  { id: '5', name: 'Horror Mix' },
];

const MixesScreen = () => {
  const scrollY = useRef(new Animated.Value(0)).current;

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, 250],  // extended range for smooth fade
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  
  const imageBlur = scrollY.interpolate({
    inputRange: [0, 350],  // match the same range
    outputRange: [0, 10],
    extrapolate: 'clamp',
  });
  
  const imageTranslateY = scrollY.interpolate({
    inputRange: [0, 350],
    outputRange: [0, -10],  // slowly slides up
    extrapolate: 'clamp',
  });

  const appNameOpacity = scrollY.interpolate({
    inputRange: [100, 160],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#323278' }}>
      {/* App Name Appearing on Scroll */}
      <Animated.Text style={[styles.appName, { opacity: appNameOpacity }]}>
        MovieCove
      </Animated.Text>
     
      <Animated.ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 10 }}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        {/* Movie Poster with blur and fade */}
        <Animated.View style={[styles.posterContainer, { opacity: imageOpacity }]}>
        <Animated.Image
  source={require('../assets/sample1.jpg')}
  style={[
    styles.posterImage,
    {
      opacity: imageOpacity,
      transform: [{ translateY: imageTranslateY }],
    },
  ]}
  blurRadius={imageBlur}
/>
          <View  style={styles.gradient} />
        </Animated.View>

        {/* Top Mixes Section */}
        <Text style={styles.sectionTitle}>Top Mixes</Text>
        <Animated.ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 10 }}
          style={{ minHeight: 60 }}
        >
          {mixes.map((item) => (
            <TouchableOpacity key={item.id} style={styles.mixBox}>
              <Text style={styles.mixText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </Animated.ScrollView>

        {/* More Mixes Section */}
        <Text style={styles.sectionTitle}>More Mixes</Text>
        <View style={styles.gridContainer}>
          {mixes.map((item) => (
            <TouchableOpacity key={item.id} style={styles.bigMixBox}>
              <Text style={styles.mixText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  posterContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  posterImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    width: '100%',
    height: '50%',
    bottom: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  mixBox: {
    backgroundColor: '#4444aa',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginHorizontal: 10,
    marginBottom: 10,
    height: 100,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  bigMixBox: {
    backgroundColor: '#5555cc',
    paddingVertical: 30,
    width: '48%',
    marginBottom: 15,
    borderRadius: 20,
    alignItems: 'center',
  },
  mixText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  appName: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.9)', // slight transparency
    paddingVertical: 12,
    paddingHorizontal: 20,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'left',
    // Optional shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
   // borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  
});

export default MixesScreen;
