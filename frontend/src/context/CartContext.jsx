import React, { createContext, useState } from "react";
import axios from "axios";

export const CartContext = createContext();

function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  // Add product to cart
  const addToCart = (product) => {
    const user = JSON.parse(localStorage.getItem("user"));
    console.log("Product added:", product);
    axios
      .post("http://localhost:5000/api/cart", {
        user_id: user.id,
        product_id: product.id,
        quantity: 1
      })
      .then(() => {
        setCartItems((prevItems) => {
          const existingProduct = prevItems.find(
            (item) => item.id === product.id
          );

          if (existingProduct) {
            return prevItems.map((item) =>
              item.id === product.id
                ? {
                    ...item,
                    quantity: Number(item.quantity || 1) + 1
                  }
                : item
            );
          }

          return [
            ...prevItems,
            {
              ...product,
              quantity: 1
            }
          ];
        });
      })
      .catch((error) => {
        console.log("Add to cart error:", error);
      });
  };

  // Remove complete product from cart
  const removeFromCart = (productId) => {
    const user = JSON.parse(localStorage.getItem("user"));
    axios
      .delete(`http://localhost:5000/api/cart/${user.id}/${productId}`)
      .then(() => {
        setCartItems((prevItems) =>
          prevItems.filter((item) => item.id !== productId)
        );
      })
      .catch((error) => {
        console.log("Remove from cart error:", error);
      });
  };

  // Increase quantity
  const increaseQuantity = (productId) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const product = cartItems.find(
      (item) => item.id === productId
    );

    if (!product) return;

    const newQuantity = Number(product.quantity) + 1;

    axios
      .put(`http://localhost:5000/api/cart/${user.id}/${productId}`, {
        quantity: newQuantity
      })
      .then(() => {
        setCartItems((prevItems) =>
          prevItems.map((item) =>
            item.id === productId
              ? {
                  ...item,
                  quantity: newQuantity
                }
              : item
          )
        );
      })
      .catch((error) => {
        console.log("Increase quantity error:", error);
      });
  };

  // Decrease quantity
  const decreaseQuantity = (productId) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const product = cartItems.find(
      (item) => item.id === productId
    );

    if (!product) return;

    const newQuantity = Number(product.quantity) - 1;

    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    axios
      .put(`http://localhost:5000/api/cart/${user.id}/${productId}`, {
        quantity: newQuantity
      })
      .then(() => {
        setCartItems((prevItems) =>
          prevItems.map((item) =>
            item.id === productId
              ? {
                  ...item,
                  quantity: newQuantity
                }
              : item
          )
        );
      })
      .catch((error) => {
        console.log("Decrease quantity error:", error);
      });
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export default CartProvider;