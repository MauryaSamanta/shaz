import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  BackHandler,
  Animated,
  Easing,
} from 'react-native';
import PriceFilterDialog from './filterboxes/PriceFilter';
import BrandFilterDialog from './filterboxes/BrandFilter';
import ProductFilterDialog from './ProductFilter';
import ColorFilterDialog from './ColorFilter';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { setUpdatedPreferenceGender } from '../store/authSlice';

const FiltersBar = ({gender, setGender, getitems, brands,isbrandspecific}) => {
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
  // const [gender, setGender] = useState('men');
const anim = useRef(new Animated.Value(gender === 'men' ? 0 : 1)).current;

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
const dispatch=useDispatch();
 const toggleGender = async() => {
  const nextGender = gender === 'men' ? 'women' : 'men';

  Animated.timing(anim, {
    toValue: nextGender === 'men' ? 0 : 1,
    duration: 450,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  }).start();

  setGender(nextGender);
  getitems(nextGender)
   dispatch(setUpdatedPreferenceGender(nextGender));
};

  const formatPrice = (min, max) => {
    const toK = (val) => (parseFloat(val) / 1000).toFixed(1) + 'k';

    if (min && max) return `${toK(min)} to ${toK(max)}`;
    if (!min && max) return `<${toK(max)}`;
    if (min && !max) return `>${toK(min)}`;
    return 'Price';
  };

  const menStyle = {
  transform: [
    {
      translateX: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -18],
      }),
    },
    {
      scale: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.85],
      }),
    },
  ],
  opacity: anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  }),
};

const womenStyle = {
  position: 'absolute',
  transform: [
    {
      translateX: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [18, 0],
      }),
    },
    {
      scale: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.85, 1],
      }),
    },
  ],
  opacity: anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  }),
};


  
  return (
    <View style={styles.container}>
      {/* <Image
        source={require('../assets/images/edit.png')}
        style={{ width: 20, height: 20, marginRight: 14 }}
      /> */}
      <TouchableOpacity onPress={toggleGender} activeOpacity={0.9}>
  <View style={styles.genderWrap}>
    {/* MEN */}
   <Animated.View style={menStyle}>
  <View style={styles.genderCircle}>
    <Image
      source={require('../assets/images/men-filter.jpg')}
      style={styles.genderImage}
    />
  </View>
  {/* <Text style={styles.genderText}>Men</Text> */}
</Animated.View>

<Animated.View style={[womenStyle]}>
  <View style={styles.genderCircle}>
    <Image
      source={require('../assets/images/zara-place.jpg')}
      style={styles.genderImage}
    />
  </View>
  {/* <Text style={styles.genderText}>Women</Text> */}
</Animated.View>

  </View>
</TouchableOpacity>

<View style={styles.verticalDivider} />
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
        onClear={()=>{  getitems(gender,true,null, null,selectedBrands)}}
        onApply={(min, max) => {
          setMinPrice(min);
          setMaxPrice(max);
          getitems(gender,true,min, max,selectedBrands);
          setShowPriceDialog(false);
        }}
      />

      <BrandFilterDialog
        visible={brandDialogVisible}
        onClose={() => setBrandDialogVisible(false)}
        onClear={()=>{  setSelectedBrands([]);getitems(gender,true,minPrice, maxPrice,[])}}
        onApply={(brands) => {
          setSelectedBrands(brands);
          getitems(gender,true,minPrice,maxPrice,brands)
          setBrandDialogVisible(false);
        }}
        brandList={gender==='women'?['Zara', 'MnS', 'Bulbul Fashions', 'Bijoi', 'Bonkers Corner', 'Souled Store', 'Chimpanzee']
          :['MnS','Bonkers Corner']
        }
      />

      <ProductFilterDialog
  visible={showProductDialog}
  onClose={() => setShowProductDialog(false)}
  onClear={() => {
    setSelectedProducts([]);
    getitems(gender,true, minPrice, maxPrice, selectedBrands, []);
  }}
  onApply={(products) => {
    setSelectedProducts(products);
    getitems(gender,true, minPrice, maxPrice, selectedBrands, products);
    setShowProductDialog(false);
  }}
  productList={gender==='women'?['dresses', 'tops', 'shirts', 'jeans', 'co-ords', 'saree', 'others']:['t-shirts', 'shirts','jeans','hoodies']}
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
      {/* {isbrandspecific && (
  <Text style={styles.brandName}>
    {brands}
  </Text>
)} */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    // paddingLeft: 30,
    paddingVertical: 8,
    paddingHorizontal:20,
    backgroundColor: 'transparent',
    marginLeft: 20,
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
genderWrap: {
  position: 'relative', 
  marginLeft:10,
  // marginRight: 12,
  // alignItems: 'center',
  // justifyContent: 'center',
},

genderCircle: {
 width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: '#000',
  overflow: 'hidden',
  alignSelf: 'center',
  
},

genderImage: {
  width: 32,
  height: 32,
  borderRadius: 13,
  resizeMode: 'cover',
  // zIndex:4
},

genderText: {
  // marginTop: 4,
  fontSize: 8,
  fontWeight: '600',
  color: '#000',
  textAlign: 'center',
},
verticalDivider: {
  width: 1,
  height: 26,
  backgroundColor: '#d0d0d0',
  marginHorizontal: 10, // space around divider ONLY
  alignSelf: 'center',
},


});

export default FiltersBar;
