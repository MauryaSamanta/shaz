import { loadCart, updateCart } from "./cartStorage";

// Add item
export const addItemToCart = async (item) => {
  const cart = await loadCart();
  const index = cart.findIndex(i => i.item_id === item.item_id);

  if (index !== -1) {
    cart[index].quantity += item.quantity || 1;
  } else {
    cart.push({ ...item, quantity: item.quantity || 1 });
  }

  await updateCart(cart);
};

// Remove item
export const removeItemFromCart = async (itemId) => {
  const cart = await loadCart();
  const newCart = cart.filter(i => i.item_id !== itemId);
  await updateCart(newCart);
};
