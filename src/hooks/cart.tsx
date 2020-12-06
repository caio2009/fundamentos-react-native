import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      try {
        const json = await AsyncStorage.getItem('@gomarketplace:products');

        if (json) {
          const products = JSON.parse(json);
          setProducts(products);
        }
      } catch (e) {
        console.log('Async Storage Error');
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(async product => {
    const productInCart = products.find(el => el.id === product.id);

    if (productInCart) {
      increment(productInCart.id);
    } else {
      product.quantity = 1;

      await AsyncStorage.setItem('@gomarketplace:products', JSON.stringify([...products, product]));
      setProducts([...products, product]);
    }
  }, [products, setProducts]);

  const increment = useCallback(async id => {
    const productIndex = products.findIndex(el => el.id === id);

    const productsClone = [...products];

    const productToUpdate = productsClone[productIndex];
    productToUpdate.quantity++;

    productsClone[productIndex] = productToUpdate;

    await AsyncStorage.setItem('@gomarketplace:products', JSON.stringify(productsClone));
    setProducts(productsClone);
  }, [products, setProducts]);

  const decrement = useCallback(async id => {
    const productIndex = products.findIndex(el => el.id === id);

    if (products[productIndex].quantity > 0) {
      const productsClone = [...products];

      const productToUpdate = productsClone[productIndex];
      productToUpdate.quantity--;

      productsClone[productIndex] = productToUpdate;

      await AsyncStorage.setItem('@gomarketplace:products', JSON.stringify(productsClone));
      setProducts(productsClone);
    }
  }, [products, setProducts]);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
