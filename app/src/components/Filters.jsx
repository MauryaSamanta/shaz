import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';

const { width } = Dimensions.get('window');

const FiltersBarWithPics = () => {
  const [selectedGender, setSelectedGender] = useState(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Use placeholder images (e.g., via https://picsum.photos)
  const menCategories = [
    { name: 'All', img: { uri: 'https://picsum.photos/seed/menall/80' } },
    { name: 'Shirts', img: { uri: 'https://picsum.photos/seed/shirt/80' } },
    { name: 'Trousers', img: { uri: 'https://picsum.photos/seed/trouser/80' } },
    { name: 'Formals', img: { uri: 'https://picsum.photos/seed/formal/80' } },
    { name: 'T-Shirts', img: { uri: 'https://picsum.photos/seed/tshirt/80' } },
    { name: 'Shorts', img: { uri: 'https://picsum.photos/seed/shorts/80' } },
  ];

  const womenCategories = [
    { name: 'All', img: { uri: 'https://picsum.photos/seed/womenall/80' } },
    { name: 'Dresses', img: { uri: 'https://picsum.photos/seed/dress/80' } },
    { name: 'Tops', img: { uri: 'https://picsum.photos/seed/top/80' } },
    { name: 'Shorts', img: { uri: 'https://picsum.photos/seed/wshorts/80' } },
    { name: 'Formals', img: { uri: 'https://picsum.photos/seed/wformal/80' } },
    { name: 'Skirts', img: { uri: 'https://picsum.photos/seed/skirt/80' } },
  ];

  const handleGenderSelect = (gender) => {
    setSelectedGender(gender);
    Animated.timing(slideAnim, {
      toValue: -width,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleBack = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setSelectedGender(null));
  };

  const categories =
    selectedGender === 'men' ? menCategories : womenCategories;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.sliderContainer,
          { transform: [{ translateX: slideAnim }] },
        ]}
      >
        {/* GENDER SELECTION VIEW */}
        <View style={[styles.genderRow, { width }]}>
          <TouchableOpacity
            style={styles.genderOption}
            onPress={() => handleGenderSelect('men')}
          >
            <Image
              source={{ uri: 'https://picsum.photos/seed/men/100' }}
              style={styles.genderImage}
            />
            <Text style={styles.genderText}>Men</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.genderOption}
            onPress={() => handleGenderSelect('women')}
          >
            <Image
              source={{ uri: 'https://picsum.photos/seed/women/100' }}
              style={styles.genderImage}
            />
            <Text style={styles.genderText}>Women</Text>
          </TouchableOpacity>
        </View>

        {/* CATEGORY SELECTION VIEW */}
        <View style={[styles.categoryRow, { width }]}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollRow}
          >
            {categories.map((item, index) => (
              <TouchableOpacity key={index} style={styles.categoryItem}>
                <Image source={item.img} style={styles.categoryImage} />
                <Text style={styles.categoryText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 90,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderContainer: {
    flexDirection: 'row',
    width: width * 2,
  },
  genderRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  genderOption: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  genderText: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '600',
    color: 'black',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    paddingLeft: 12,
    paddingRight: 4,
  },
  backArrow: {
    fontSize: 24,
    color: 'black',
  },
  scrollRow: {
    paddingLeft: 10,
    alignItems: 'center',
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 18,
  },
  categoryImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 4,
    backgroundColor: '#e0e0e0',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'black',
  },
});

export default FiltersBarWithPics;
