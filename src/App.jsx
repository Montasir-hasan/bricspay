import { useEffect, useState, useRef } from 'react';
import { doc, onSnapshot, updateDoc } from "@firebase/firestore";
import { db } from "./database/firebase";
import './Components/amination.css';
import AppRoutes from './Routes';
import { TonCoinProvider } from './Components/Context/TonCoinContext';
import { ShibCoinProvider } from './Components/Context/ShibCoinContext';
import { CounterProvider, useCounter } from './Components/Context/CounterContext'; // ✅ IMPORT useCounter
import LoadingScreen from './Components/Loader.jsx'; // ✅ IMPORT LoadingScreen

// This component holds the persistent logic and doesn't render anything itself
function AppLogic() {
  const { setCounter, setMinerSpeed, setTelegramUserId, counter, minerSpeed, telegramUserId } = useCounter();
  const lastUpdateTimeRef = useRef(Date.now());

  // 1. Set up real-time listener for user data from Firebase
  useEffect(() => {
    const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
    if (!userId) return;

    const userIdStr = userId.toString();
    setTelegramUserId(userIdStr);
    const userDocRef = doc(db, 'miningapp', userIdStr);

    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        setCounter(userData.counter || 0);
        setMinerSpeed(userData.minerSpeed || 2);
        lastUpdateTimeRef.current = userData.lastUpdateTime || Date.now();
      }
    });

    return () => unsubscribe();
  }, [setCounter, setMinerSpeed, setTelegramUserId]);

  // 2. Simulate mining in the background
  useEffect(() => {
    if (!telegramUserId) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = (now - lastUpdateTimeRef.current) / 1000;
      const minedPerSecond = (minerSpeed / 100) / 86400;
      const newMinedAmount = elapsedSeconds * minedPerSecond;

      setCounter(prevCounter => prevCounter + newMinedAmount);
      lastUpdateTimeRef.current = now;
    }, 1000);

    return () => clearInterval(interval);
  }, [telegramUserId, minerSpeed, setCounter]);

  // 3. Periodically save progress to the database
  useEffect(() => {
    if (!telegramUserId) return;

    const saveProgress = async () => {
      if (counter > 0) {
        const userRef = doc(db, 'miningapp', telegramUserId);
        await updateDoc(userRef, {
          counter: counter,
          lastUpdateTime: Date.now()
        }, { merge: true });
      }
    };
    
    // Save every 10 seconds
    const saveInterval = setInterval(saveProgress, 10000);
    
    // Save when the user tries to close the app
    const handleBeforeUnload = () => saveProgress();
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(saveInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      saveProgress();
    };
  }, [counter, telegramUserId]);

  // This component now just renders the routes, logic is handled above
  return <AppRoutes />;
}


export default function App() {
  // We put the loading screen logic back here in the main entry point
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This timeout simulates your app loading assets, etc.
    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <CounterProvider>    
      <TonCoinProvider>
        <ShibCoinProvider>
          <div className='bg-black w-full min-h-screen'>
            <AppLogic />
          </div>
        </ShibCoinProvider>
      </TonCoinProvider>
    </CounterProvider>
  );
}
