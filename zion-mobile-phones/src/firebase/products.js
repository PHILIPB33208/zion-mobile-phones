import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./config";

// Listen for products from Firebase
export const listenToProducts = (callback, onError) => {
  const productsRef = collection(db, "products");

  const unsubscribe = onSnapshot(
    productsRef,
    (snapshot) => {
      const products = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      callback(products);
    },
    (error) => {
      console.error("Error loading products:", error);

      if (onError) {
        onError(error);
      }
    }
  );

  return unsubscribe;
};