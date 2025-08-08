import { useEffect, useState, useRef } from 'react';
import { doc, onSnapshot, updateDoc } from "@firebase/firestore";
import { db } from "./database/firebase";
import './Components/amination.css';
import AppRoutes from './Routes';
import { TonCoinProvider } from './Components/Context/TonCoinContext';
import { ShibCoinProvider } from './Components/Context/ShibCoinContext';
import { CounterProvider, useCounter } from './Components/Context/CounterContext';
import LoadingScreen from './Components/Loader.jsx';

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
        setMinerSpeed(userData.minerSpeed || 2); // Still needed for display
        lastUpdateTimeRef.current = userData.lastUpdateTime || Date.now();
      }
    });

    return () => unsubscribe();
  }, [setCounter, setMinerSpeed, setTelegramUserId]);

  // 2. Simulate mining in the background with PRECISION MATH
  useEffect(() => {
    if (!telegramUserId) return;

    const interval = setInterval(() => {
      const now = Date.now();
      let elapsedSeconds = (now - lastUpdateTimeRef.current) / 1000;

      const maxOfflineSeconds = 7200; // 2 hours offline limit
      if (elapsedSeconds > maxOfflineSeconds) {
        elapsedSeconds = maxOfflineSeconds;
      }
      
      // =================================================================
      //  PRECISION MATH FIX FOR VERY SLOW MINING SPEED
      // =================================================================
      // The fixed rate per second.
      const minedPerSecond = 0.000000001;
      const newMinedAmount = elapsedSeconds * minedPerSecond;
      
      // Update state with a function to ensure we always have the latest value
      setCounter(prevCounter => {
        // To avoid JavaScript precision errors with small decimals, we work with integers
        // Multiply both numbers by 10^9 to make them whole, add them, then divide back.
        const prevCounterAsInteger = Math.round(prevCounter * 1e9);
        const newMinedAsInteger = Math.round(newMinedAmount * 1e9);
        
        const newTotalAsInteger = prevCounterAsInteger + newMinedAsInteger;
        
        return newTotalAsInteger / 1e9; // Convert back to a decimal
      });
      // =================================================================
      
      lastUpdateTimeRef.current = now;
    }, 1000); // This loop runs every second

    return () => clearInterval(interval);
  }, [telegramUserId, setCounter]); // minerSpeed is removed from dependencies as it's not used in calculation

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
    
    const saveInterval = setInterval(saveProgress, 10000);
    const handleBeforeUnload = () => saveProgress();
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(saveInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      saveProgress();
    };
  }, [counter, telegramUserId]);

  return <AppRoutes />;
}


// This is the main component for your entire application
export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
