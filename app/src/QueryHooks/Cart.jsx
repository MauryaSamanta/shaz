
import { useQuery,useMutation, useQueryClient } from "@tanstack/react-query";



export const useAddToCart = (userId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, quantity = 1 }) => {
      const response = await fetch("https://shaz-dsdo.onrender.com/v1/cart/add/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          item_id: itemId,
          quantity,
        }),
      });

      if (!response.ok) throw new Error("Failed to add item to cart");
      return response.json(); // returns { item: {...} }
    },

    onSuccess: () => {
      // Refetch the cart to keep cache in sync with backend
      queryClient.invalidateQueries(["cart", userId]);
    },
  });
};


export const useRemoveFromCart = (userId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId) => {
      const response = await fetch("https://shaz-dsdo.onrender.com/v1/cart/remove/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          item_id: itemId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove item from cart");
      }

      return response.json();
    },

    onSuccess: (_, itemId) => {
      queryClient.setQueryData(["cart", userId], (oldData) => {
        if (!oldData) return [];
        // remove item locally
        return oldData.filter((i) => i.item_id !== itemId);
      });
    },
  });
};

export const fetchCart = async (userId) => {
  const response = await fetch(`https://shaz-dsdo.onrender.com/v1/cart/${userId}/`);
  if (!response.ok) throw new Error("Failed to fetch cart");
  const data = await response.json();
  // console.log(data)
  return data.items.map((item) => ({ ...item, quantity: 1 }));

};

export const useCart = (userId) => {
  return useQuery({
    queryKey: ["cart", userId],
    queryFn: () => fetchCart(userId),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    cacheTime: 1000 * 60 * 10, // keep in cache for 10 min
  });
};
