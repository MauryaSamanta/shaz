import { EventEmitter } from "events";

export const cartEmitter = new EventEmitter();

// Whenever cart changes, emit an event:
export const updateCart = async (newCart) => {
  await saveCart(newCart);
  cartEmitter.emit("cartChanged", newCart);
};
