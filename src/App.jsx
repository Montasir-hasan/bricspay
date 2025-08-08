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
  // This hook runs once and keeps the connection open to receive live updates.
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

    // This cleans up the listener when the app is fully closed.
    return () => unsubscribe();
  }, [setCounter, setMinerSpeed, setTelegramUserId]);

  // 2. Simulate mining in the background
  // This logic runs continuously as long as the app is open.
  useEffect(() => {
    if (!telegramUserId) return; // Wait for user ID before starting

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = (now - lastUpdateTimeRef.current) / 1000;

      // =================================================================
      //  MINING SPEED CONTROL
      //  To make mining slower, INCREASE the difficultyFactor number.
      //  Example: 100 makes it 100x slower. 1000 makes it 1000x slower.
      // =================================================================
      const difficultyFactor = 100; // <-- ADJUST THIS NUMBER TO BALANCE YOUR GAME
      const dailyProfitFormula = minerSpeed / 100;
      const minedPerSecond = (dailyProfitFormula / difficultyFactor) / 86400; // 86400 seconds in a day
      // =================================================================

      const newMinedAmount = elapsedSeconds * minedPerSecond;

      setCounter(prevCounter => prevCounter + newMinedAmount);
      lastUpdateTimeRef.current = now;
    }, 1000); // This loop runs every second

    return () => clearInterval(interval); // Cleanup on component change
  }, [telegramUserId, minerSpeed, setCounter]);

  // 3. Periodically save progress to the database to prevent data loss
  useEffect(() => {
    if (!telegramUserId) return;

    const saveProgress = async () => {
      // We check the counter from the state to save the latest value
      if (counter > 0) {
        const userRef = doc(db, 'miningapp', telegramUserId);
        await updateDoc(userRef, {
          counter: counter,
          lastUpdateTime: Date.now()
        }, { merge: true });
      }
    };
    
    // Save progress every 10 seconds
    const saveInterval = setInterval(saveProgress, 10000);
    
    // Also save progress right before the user closes the app
    const handleBeforeUnload = () => saveProgress();
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup function to stop the interval and listener
    return () => {
      clearInterval(saveInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      saveProgress(); // Perform one final save when cleaning up
    };
  }, [counter, telegramUserId]);

  // This component's only job is to render the page routes
  return <AppRoutes />;
}


// This is the main component for your entire application
export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This timeout shows your loading screen for 3 seconds on startup
    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Show loading screen while isLoading is true
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Once loaded, render the entire application with its providers
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
