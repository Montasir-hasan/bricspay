import { createContext, useState, useContext, useEffect } from 'react';
import { doc, onSnapshot } from "@firebase/firestore";
import { db } from "../../database/firebase"; // adjust path if different

const TonCoinContext = createContext();

export const TonCoinProvider = ({ children }) => {
  const [tonBalance, setTonBalance] = useState(0);

  useEffect(() => {
    const telegramUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
    if (!telegramUserId) return;

    const userRef = doc(db, 'miningapp', telegramUserId.toString());

    // Firestore real-time listener
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.data();
        setTonBalance(userData.tonCoinBalance || 0);
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

export const useTonCoin = () => {
  return useContext(TonCoinContext);
};

