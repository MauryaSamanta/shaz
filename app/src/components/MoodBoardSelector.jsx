import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';

const MoodboardSelector = ({moodboards, onSelect, ott}) => {
  const [selected, setSelected] = useState(null);

  const handleSelect = moodboard => {
    setSelected(moodboard);
    onSelect(moodboard); // callback to parent
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select {ott ? 'Platform' : 'Moodboard'}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {moodboards.map(mb => (
          <TouchableOpacity
            key={mb.id}
            style={[
              styles.moodboardBtn,
              selected?.id === mb.id && styles.selectedBtn,
            ]}
            onPress={() => handleSelect(mb)}>
            {ott && mb.logo && (
              <Image
                source={mb.logo}
                style={styles.logo}
                resizeMode="contain"
              />
            )}
            <Text style={styles.btnText}>{mb.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  title: {
    fontSize: 18,
    color: 'white',
    marginBottom: 10,
  },
  moodboardBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#333',
    borderRadius: 20,
    marginRight: 10,
    height: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  selectedBtn: {
    backgroundColor: '#7f5af0',
  },
  btnText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 10,
  },
  logo: {
    width: 30,
    height: 30,
  },
});

export default MoodboardSelector;