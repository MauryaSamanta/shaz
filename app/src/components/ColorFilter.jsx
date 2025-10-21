import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function ColorFilterDialog({ visible, onClose, onApply, onClear, productList }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(productList || []);
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(productList);
    } else {
      setFilteredProducts(
        productList.filter((product) =>
          product.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, productList]);

  useEffect(() => {
    if (!visible) {
    //   setSelectedProducts([]);
      setSearchTerm('');
    }
  }, [visible]);

  const toggleProduct = (product) => {
    setSelectedProducts((prev) =>
      prev.includes(product)
        ? prev.filter((p) => p !== product)
        : [...prev, product]
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => toggleProduct(item)}
      style={styles.productItem}
    >
      <View style={styles.checkbox}>
        {selectedProducts.includes(item) && <View style={styles.checked} />}
      </View>
      <Text style={styles.productText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>Color and Location filters are coming to you soon!!!</Text>
          
        
          
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    width: width * 0.85,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    elevation: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  searchInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 12,
  },
  list: {
    flexGrow: 0,
    maxHeight: 300,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  productText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: '#555',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checked: {
    width: 12,
    height: 12,
    backgroundColor: 'black',
    borderRadius: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#eee',
    padding: 12,
    borderRadius: 12,
    marginRight: 10,
    alignItems: 'center',
  },
  clearText: {
    color: '#333',
    fontWeight: '600',
  },
  addButton: {
    flex: 1,
    backgroundColor: 'black',
    padding: 12,
    borderRadius: 12,
    marginLeft: 10,
    alignItems: 'center',
  },
  addText: {
    color: 'white',
    fontWeight: '600',
  },
});
