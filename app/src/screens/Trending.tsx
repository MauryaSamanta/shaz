import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';

const cities = [
    { id: '1', name: 'Mumbai', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80' },
    { id: '2', name: 'Delhi', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80' },
    { id: '3', name: 'Bangalore', image: 'https://images.unsplash.com/photo-1493244040629-496f6d136cc3?auto=format&fit=crop&w=600&q=80' },
    { id: '4', name: 'Chennai', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80' },
  ];
  
  const universities = [
    { id: '1', name: 'IIT Bombay', image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80' },
    { id: '2', name: 'Delhi University', image: 'https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?auto=format&fit=crop&w=600&q=80' },
    { id: '3', name: 'BITS Pilani', image: 'https://images.unsplash.com/photo-1483794344563-d27a8d18014e?auto=format&fit=crop&w=600&q=80' },
    { id: '4', name: 'IISc Bangalore', image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=600&q=80' },
  ];
  
  

const TrendingScreen = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <TextInput
        placeholder="Search..."
        placeholderTextColor="#999"
        style={styles.searchInput}
      />

      <Text style={styles.sectionTitle}>Trending</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 10, marginBottom:30 }}>
  {cities.map((item) => (
    <TouchableOpacity
      key={item.id}
      style={{
        marginRight: 15,
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      <View style={{ width: 160, height: 130, position: 'relative' }}>
        <Image
          source={{ uri: item.image }}
          style={{ width: '100%', height: 130, borderRadius: 12 }}
        />
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0, 0, 0, 0.35)',
            borderRadius: 12,
          }}
        />
        <Text
          style={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            color: '#fff',
            fontSize: 16,
            fontWeight: 'bold',
          }}
        >
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  ))}
</ScrollView>

      <Text style={styles.sectionTitle}>Browse Wishlists</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 10 }}>
  {universities.map((item) => (
    <TouchableOpacity
      key={item.id}
      style={{
        width: '48%',
        aspectRatio: 1.2,
        borderRadius: 12,
        marginBottom: 15,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Image
        source={{ uri: item.image }}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 12,
        }}
      />
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: 12,
        }}
      />
      <Text
        style={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          color: 'white',
          fontSize: 15,
          fontWeight: 'bold',
        }}
      >
        Popular @ {item.name}
      </Text>
    </TouchableOpacity>
  ))}
</View>

    </ScrollView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e2e',
    paddingTop: 20,
  },
  searchInput: {
    backgroundColor: '#2e2e3e',
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 10,
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginVertical: 15,
    
  },
  horizontalScroll: {
    paddingLeft: 20,
  },
  cityCard: {
    marginRight: 15,
    width: width * 0.6,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#333',
  },
  cityImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  cityText: {
    padding: 10,
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  uniCard: {
    width: '47%',
    marginBottom: 20,
    backgroundColor: '#444',
    borderRadius: 15,
    overflow: 'hidden',
  },
  uniImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  uniText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    padding: 10,
  },
});

export default TrendingScreen;
