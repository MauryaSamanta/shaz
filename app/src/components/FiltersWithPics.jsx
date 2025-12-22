import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';

const FiltersNew = ({ getitems, brands, isbrandspecific }) => {
  const [selectedGender, setSelectedGender] = useState(null);

  const menCategories = ['All', 'Shirts', 'Trousers', 'Formals', 'T-Shirts', 'Shorts'];
  const womenCategories = ['All', 'Dresses', 'Tops', 'Shorts', 'Formals', 'Skirts'];

  const handleBack = () => {
    setSelectedGender(null);
  };

  return (
    <View style={styles.container}>
     {!selectedGender&&( <Image
        source={require('../assets/images/edit.png')}
        style={{ width: 20, height: 20, marginRight: 14 }}
      />)}

      {/* If no gender selected, show Men/Women */}
      {!selectedGender && (
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 100,
            marginLeft: 50,
          }}
        >
          <TouchableOpacity
            onPress={() => setSelectedGender('men')}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <Image
              source={require('../assets/images/men.png')}
              style={{ width: 15, height: 15 }}
            />
            <Text>Men</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedGender('women')}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <Image
              source={require('../assets/images/women.png')}
              style={{ width: 15, height: 15 }}
            />
            <Text>Women</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* If gender selected, show that gender’s categories */}
      {selectedGender && (
        <View style={{ flexDirection: 'row', alignItems: 'center', }}>
          {/* Back button */}
          <TouchableOpacity onPress={handleBack} style={{ marginRight: 20 }}>
            <Text style={{ fontSize: 18 }}>←</Text>
          </TouchableOpacity>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ flexDirection: 'row', gap: 40 }}
          >
            {(selectedGender === 'men' ? menCategories : womenCategories).map(
              (cat, i) => (
                <TouchableOpacity
                  key={i}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                  <Image
                    source={
                      selectedGender === 'men'
                        ? require('../assets/images/men.png')
                        : require('../assets/images/women.png')
                    }
                    style={{ width: 15, height: 15 }}
                  />
                  <Text>{cat}</Text>
                </TouchableOpacity>
              ),
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    minWidth: '100%',
    alignItems: 'center',
    // paddingLeft: 30,
    paddingVertical: 6,
    backgroundColor: 'transparent',
    marginLeft: -30,
  },
});

export default FiltersNew;
