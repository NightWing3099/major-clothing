import { createContext, useContext, useReducer, useCallback, useMemo, useEffect } from 'react';
import { saveCart, loadCart } from '../db/database';

// Utility functions (pure, memoizable)
export const addCartItem = (cartItems, productToAdd) => {
  const idx = cartItems.findIndex((item) => item.id === productToAdd.id);
  if (idx >= 0) {
    const updated = [...cartItems];
    updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + 1 };
    return updated;
  }
  return [...cartItems, { ...productToAdd, quantity: 1 }];
};

export const removeItemFromCart = (cartItems, cartItemToRemove) => {
  const existing = cartItems.find((item) => item.id === cartItemToRemove.id);
  if (!existing) return cartItems;
  if (existing.quantity === 1) {
    return cartItems.filter((item) => item.id !== cartItemToRemove.id);
  }
  return cartItems.map((item) =>
    item.id === cartItemToRemove.id
      ? { ...item, quantity: item.quantity - 1 }
      : item
  );
};

export const clearCartItem = (cartItems, cartItemToClear) =>
  cartItems.filter((item) => item.id !== cartItemToClear.id);

// Action types
const CART_ACTIONS = {
  SET_ITEMS: 'SET_ITEMS',
  SET_OPEN: 'SET_OPEN',
};

const initialState = {
  isCartOpen: false,
  cartItems: [],
  cartCount: 0,
  cartTotal: 0,
};

const deriveCartStats = (items) => ({
  cartCount: items.reduce((sum, item) => sum + item.quantity, 0),
  cartTotal: items.reduce((sum, item) => sum + item.quantity * item.price, 0),
});

const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.SET_ITEMS: {
      const stats = deriveCartStats(action.payload);
      return { ...state, cartItems: action.payload, ...stats };
    }
    case CART_ACTIONS.SET_OPEN:
      return { ...state, isCartOpen: action.payload };
    default:
      return state;
  }
};

export const CartContext = createContext({
  isCartOpen: false,
  setIsCartOpen: () => {},
  cartItems: [],
  addItemToCart: () => {},
  removeItemToCart: () => {},
  clearItemFromCart: () => {},
  cartCount: 0,
  cartTotal: 0,
});

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load persisted cart on mount
  useEffect(() => {
    loadCart().then((items) => {
      if (items && items.length > 0) {
        const mapped = items.map((i) => ({
          id: i.productId,
          name: i.name,
          imageUrl: i.imageUrl,
          price: i.price,
          quantity: i.quantity,
        }));
        dispatch({ type: CART_ACTIONS.SET_ITEMS, payload: mapped });
      }
    });
  }, []);

  // Persist cart changes
  useEffect(() => {
    saveCart(state.cartItems);
  }, [state.cartItems]);

  const setIsCartOpen = useCallback((open) => {
    dispatch({ type: CART_ACTIONS.SET_OPEN, payload: open });
  }, []);

  const addItemToCart = useCallback(
    (productToAdd) => {
      const updated = addCartItem(state.cartItems, productToAdd);
      dispatch({ type: CART_ACTIONS.SET_ITEMS, payload: updated });
    },
    [state.cartItems]
  );

  const removeItemToCart = useCallback(
    (cartItemToRemove) => {
      const updated = removeItemFromCart(state.cartItems, cartItemToRemove);
      dispatch({ type: CART_ACTIONS.SET_ITEMS, payload: updated });
    },
    [state.cartItems]
  );

  const clearItemFromCart = useCallback(
    (cartItemToClear) => {
      const updated = clearCartItem(state.cartItems, cartItemToClear);
      dispatch({ type: CART_ACTIONS.SET_ITEMS, payload: updated });
    },
    [state.cartItems]
  );

  const value = useMemo(
    () => ({
      isCartOpen: state.isCartOpen,
      setIsCartOpen,
      cartItems: state.cartItems,
      addItemToCart,
      removeItemToCart,
      clearItemFromCart,
      cartCount: state.cartCount,
      cartTotal: state.cartTotal,
    }),
    [
      state.isCartOpen,
      state.cartItems,
      state.cartCount,
      state.cartTotal,
      setIsCartOpen,
      addItemToCart,
      removeItemToCart,
      clearItemFromCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);