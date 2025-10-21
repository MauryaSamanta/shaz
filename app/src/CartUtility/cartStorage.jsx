import AsyncStorage from "@react-native-async-storage/async-storage";

const CART_KEY = "user_cart";

// Save cart to AsyncStorage
export const saveCart = async (cart) => {
  try {
    await AsyncStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (e) {
    console.error("Failed to save cart", e);
  }
};

// Load cart from AsyncStorage
export const loadCart = async () => {
  try {
    const data = await AsyncStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load cart", e);
    return [];
  }
};
