import { createContext, useState, useContext, useEffect } from 'react';
import { doc, onSnapshot } from "@firebase/firestore";
import { db } from "../../database/firebase";

const TonCoinContext = createContext();

export const TonCoinProvider = ({ children }) => {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    const telegramUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
    if (!telegramUserId) return;

    const userRef = doc(db, 'miningapp', telegramUserId.toString());

    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.data();
        setCounter(userData.counter || 0);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <TonCoinContext.Provider value={{ counter, setCounter }}>
      {children}
    </TonCoinContext.Provider>
  );
};

export const useTonCoin = () => useContext(TonCoinContext);
