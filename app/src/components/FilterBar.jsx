import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  BackHandler,
} from 'react-native';
import PriceFilterDialog from './filterboxes/PriceFilter';
import BrandFilterDialog from './filterboxes/BrandFilter';
import ProductFilterDialog from './ProductFilter';
import ColorFilterDialog from './ColorFilter';

const FiltersBar = ({getitems, brands,isbrandspecific}) => {
  const filters = isbrandspecific ? ['Price', 'Product', 'Color', 'Location'] : ['Brand', 'Price', 'Product', 'Color', 'Location'];
  // console.log(brands)

  const [showPriceDialog, setShowPriceDialog] = useState(false);
  const [brandDialogVisible, setBrandDialogVisible] = useState(false);
  const [showProductDialog, setShowProductDialog] = useState(false);
    const [showColorDialog, setshowColorDialog] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedBrands, setSelectedBrands] = useState([brands]);
    useEffect(() => {
    const onBackPress = () => {
      if (showPriceDialog) {
        setShowPriceDialog(false);
        return true; // prevent default back
      }
      if (brandDialogVisible) {
        setBrandDialogVisible(false);
        return true;
      }
      if (showProductDialog) {
        setShowProductDialog(false);
        return true;
      }
      if (showColorDialog) {
        setshowColorDialog(false);
        return true;
      }
      return false; // no dialog open → let navigation handle
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );

    return () => backHandler.remove();
  }, [showPriceDialog, brandDialogVisible, showProductDialog, showColorDialog]);
  const formatPrice = (min, max) => {
    const toK = (val) => (parseFloat(val) / 1000).toFixed(1) + 'k';

    if (min && max) return `${toK(min)} to ${toK(max)}`;
    if (!min && max) return `<${toK(max)}`;
    if (min && !max) return `>${toK(min)}`;
    return 'Price';
  };

  
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/edit.png')}
        style={{ width: 20, height: 20, marginRight: 14 }}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {filters.map((filter, index) => {
          const isPrice = filter === 'Price';
          const isBrand = filter === 'Brand';
          const isProduct= filter === 'Product';
          const isColor= filter === 'Color';
          const isLocation= filter === 'Location';
          const priceActive = minPrice || maxPrice;
          const brandActive = selectedBrands.length > 0 && selectedBrands[0] !== null;
          const isProductActive = selectedProducts.length > 0 && selectedProducts[0] !== null;
          let label = filter;
          if (isPrice && priceActive) {
            label = formatPrice(minPrice, maxPrice);
          }
          if (isBrand && brandActive) {
            label = `Brand (${selectedBrands.length})`;
          }
          if(isProduct && isProductActive) {
            label = `Product (${selectedProducts.length})`;
          }

          const isActive = (isPrice && priceActive) || (isBrand && brandActive) || (isProduct && isProductActive);

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.filterBtn,
                isActive && { backgroundColor: 'black' },
              ]}
              onPress={() => {
                if (isPrice) setShowPriceDialog(true);
                else if (isBrand) setBrandDialogVisible(true);
                else if(isProduct) setShowProductDialog(true);
                else if(isColor) setshowColorDialog(true);
                else if(isLocation) setshowColorDialog(true);
              }}
            >
              <Text
                style={[
                  styles.filterText,
                  isActive && { color: 'white' },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <PriceFilterDialog
        visible={showPriceDialog}
        onClose={() => setShowPriceDialog(false)}
        onClear={()=>{  getitems(true,null, null,selectedBrands)}}
        onApply={(min, max) => {
          setMinPrice(min);
          setMaxPrice(max);
          getitems(true,min, max,selectedBrands);
          setShowPriceDialog(false);
        }}
      />

      <BrandFilterDialog
        visible={brandDialogVisible}
        onClose={() => setBrandDialogVisible(false)}
        onClear={()=>{  setSelectedBrands([]);getitems(true,minPrice, maxPrice,[])}}
        onApply={(brands) => {
          setSelectedBrands(brands);
          getitems(true,minPrice,maxPrice,brands)
          setBrandDialogVisible(false);
        }}
        brandList={['Zara', 'MnS']}
      />

      <ProductFilterDialog
  visible={showProductDialog}
  onClose={() => setShowProductDialog(false)}
  onClear={() => {
    setSelectedProducts([]);
    getitems(true, minPrice, maxPrice, selectedBrands, []);
  }}
  onApply={(products) => {
    setSelectedProducts(products);
    getitems(true, minPrice, maxPrice, selectedBrands, products);
    setShowProductDialog(false);
  }}
  productList={['dresses', 'tops', 'shorts']}
/>

 <ColorFilterDialog
  visible={showColorDialog}
  onClose={() => setshowColorDialog(false)}
  // onClear={() => {
  //   setSelectedProducts([]);
  //   getitems(true, minPrice, maxPrice, selectedBrands, []);
  // }}
  // onApply={(products) => {
  //   setSelectedProducts(products);
  //   getitems(true, minPrice, maxPrice, selectedBrands, products);
  //   setShowProductDialog(false);
  // }}
  // productList={['dresses', 'tops', 'shorts']}
/>
      {isbrandspecific && (
  <Text style={styles.brandName}>
    {brands}
  </Text>
)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 30,
    paddingVertical: 8,
    backgroundColor: 'transparent',
    marginLeft: 10,
  },
  filterBtn: {
    backgroundColor: '#e0e0e0',
    borderRadius: 11,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 10,
  },
  filterText: {
    color: 'black',
    fontSize: 14,
    fontWeight: '500',
  },
 brandName: {
  // backgroundColor: '#e0e0e0',
  borderRadius: 11,
  // paddingVertical: 6,
  paddingHorizontal: 14,
  marginRight: 10,
  fontSize: 24,
  fontWeight: '500',
  color: 'black',
  textAlignVertical: 'center',
  overflow: 'hidden', // optional, in case of font overflow
},

});

export default FiltersBar;
