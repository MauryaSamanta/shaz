import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
//import LinearGradient from 'react-native-linear-gradient';

const dummyItems = Array.from({ length: 20 }, (_, i) => ({
  id: `${i + 1}`,
  title: `Item ${i + 1}`,
}));

const ScrollableDemoScreen = () => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
     <View style={styles.posterContainer}>
             <Image source={require('../assets/sample1.jpg')} style={styles.posterImage} />
             <LinearGradient colors={['transparent', '#323278']} style={styles.gradient} />
           </View>

      {/* Section 1 */}
      <Text style={styles.sectionTitle}>Featured</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScroll}
      >
        {dummyItems.slice(0, 10).map((item) => (
          <TouchableOpacity key={item.id} style={styles.horizontalBox}>
            <Text style={styles.boxText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Section 2 */}
      <Text style={styles.sectionTitle}>Recommended</Text>
      {dummyItems.slice(0, 6).map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.cardText}>{item.title}</Text>
        </View>
      ))}

      {/* Section 3: Grid */}
      <Text style={styles.sectionTitle}>Categories</Text>
      <View style={styles.grid}>
        {dummyItems.slice(0, 8).map((item) => (
          <View key={item.id} style={styles.gridItem}>
            <Text style={styles.boxText}>{item.title}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e2e',
  },
  posterContainer: {
    width: '100%',
    height: 400,
    //position: 'relative',
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
    color: '#fff',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  horizontalScroll: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  horizontalBox: {
    backgroundColor: '#3d3d5c',
    padding: 20,
    marginRight: 10,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  boxText: {
    color: '#fff',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#2c2c44',
    padding: 20,
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 20,
  },
  cardText: {
    color: '#fff',
    fontSize: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  gridItem: {
    backgroundColor: '#4a4a6a',
    width: '47%',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
});

export default ScrollableDemoScreen;
