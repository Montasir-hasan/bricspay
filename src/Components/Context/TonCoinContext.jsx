import { createContext, useState, useContext, useEffect } from 'react';
import { doc, onSnapshot } from "@firebase/firestore";
import { db } from "../../database/firebase"; // Adjust this path

const TonCoinContext = createContext();

export const TonCoinProvider = ({ children }) => {
  const [tonBalance, setTonBalance] = useState(0);

  useEffect(() => {
    const telegramUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
    console.log("TonCoinProvider userId:", telegramUserId);
    if (!telegramUserId) return;

    const userRef = doc(db, 'miningapp', telegramUserId.toString());

    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.data();
        console.log("TonCoinContext onSnapshot data:", userData);
        setTonBalance(userData.tonCoinBalance || 0);
      } else {
        console.log("TonCoinContext: No user document found.");
        setTonBalance(0);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <TonCoinContext.Provider value={{ tonBalance, setTonBalance }}>
      {children}
    </TonCoinContext.Provider>
  );
};

export const useTonCoin = () => useContext(TonCoinContext);
