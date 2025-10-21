import React from 'react';
import { StyleSheet, TextInput, View, Image } from 'react-native';

const SearchBar = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/search.png')}
        style={styles.icon}
      />
      <TextInput
        placeholder="Search"
        placeholderTextColor="#ffffff99"
        style={styles.input}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '65%',
    height: 44, // tighter height
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 20,
    paddingHorizontal: 12,
    alignSelf: 'center',
  },
  icon: {
    width: 16,
    height: 16,
    marginRight: 8,
    tintColor: '#ffffff99',
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    paddingVertical: 0, // no extra vertical padding
  },
});

export default SearchBar;
