import { useTonCoin } from "./Context/TonCoinContext.jsx";
import mainlogo from '../assets/fan.png';
import { useState, useEffect, useRef } from "react";
import '../App.css';
import { doc, getDoc, setDoc, updateDoc, collection, addDoc } from "@firebase/firestore"; 
import { db } from "../database/firebase";
import "animate.css";
import overlayImage from '../assets/ton.png';
import UpgradeMiner from "./modal/UpgradeMiner.jsx";
import { useCounter } from '../Components/Context/CounterContext.jsx';

const LOCAL_STORAGE_KEY = "miningData";

const Heading = () => {
  const { setTonBalance } = useTonCoin();
  const { counter, setCounter } = useCounter(); 
  const [telegramUserId, setTelegramUserId] = useState(null);
  const [minerSpeed, setMinerSpeed] = useState(2);
  const [showRedAlert, setShowRedAlert] = useState(false);
  const [showGreenAlert, setShowGreenAlert] = useState(false);
  const [isUpgradeModalVisible, setIsUpgradeModalVisible] = useState(false);
  
  // Ref to avoid stale closures inside intervals
  const counterRef = useRef(counter);
  counterRef.current = counter;
  const minerSpeedRef = useRef(minerSpeed);
  minerSpeedRef.current = minerSpeed;

  // Load user data + localStorage data on mount
  useEffect(() => {
    const fetchCoinBalance = async () => {
      try {
        const id = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
        if (!id) return;

        setTelegramUserId(id);
        const userDocRef = doc(db, 'miningapp', id.toString());
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();

          // Calculate offline mining increase from localStorage timestamp
          const localMiningDataStr = localStorage.getItem(LOCAL_STORAGE_KEY);
          let offlineCounterIncrement = 0;
          if (localMiningDataStr) {
            try {
              const localMiningData = JSON.parse(localMiningDataStr);
              const lastSaved = new Date(localMiningData.lastSaved);
              const now = new Date();
              const secondsPassed = (now - lastSaved) / 1000;
              offlineCounterIncrement = secondsPassed * userData.minerSpeed * 0.00001;
            } catch (e) {
              console.warn("Failed to parse local mining data:", e);
            }
          }

          const baseCounter = userData.counter || 0;
          const totalCounter = baseCounter + offlineCounterIncrement;
          const currentBalance = userData.tonCoinBalance || 0;
          const userMinerSpeed = userData.minerSpeed || 2;

          setTonBalance(currentBalance);
          setMinerSpeed(userMinerSpeed);
          setCounter(totalCounter);
        } else {
          // New user doc creation
          await setDoc(userDocRef, {
            tonCoinBalance: 0,
            counter: 0,
            minerSpeed: 2,
            lastUpdated: new Date().toISOString(),
          });
          setTonBalance(0);
          setCounter(0);
          setMinerSpeed(2);
        }
      } catch (error) {
        console.error("Failed to fetch or create user document:", error);
      }
    };

    fetchCoinBalance();
  }, [setTonBalance, setCounter]);

  // Mining increment every second (live mining)
  useEffect(() => {
    const miningInterval = setInterval(() => {
      setCounter(prev => prev + minerSpeedRef.current * 0.00001);
    }, 1000);

    return () => clearInterval(miningInterval);
  }, []);

  // Save mining progress every 15 seconds (Firestore + localStorage)
  useEffect(() => {
    if (!telegramUserId) return;

    const saveInterval = setInterval(async () => {
      try {
        const userRef = doc(db, 'miningapp', telegramUserId.toString());
        const updatedCounter = parseFloat(counterRef.current.toFixed(9));
        const updatedMinerSpeed = minerSpeedRef.current;

        // Save to Firestore
        await updateDoc(userRef, {
          counter: updatedCounter,
          minerSpeed: updatedMinerSpeed,
          lastUpdated: new Date().toISOString(),
        });

        // Save to localStorage
        localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify({
            counter: updatedCounter,
            minerSpeed: updatedMinerSpeed,
            lastSaved: new Date().toISOString(),
          })
        );

        console.log("Mining data saved:", { counter: updatedCounter, minerSpeed: updatedMinerSpeed });
      } catch (error) {
        console.error("Failed to save mining data:", error);
      }
    }, 43200000);

    return () => clearInterval(saveInterval);
  }, [telegramUserId]);

  // Claim handler - reset counter and add to balance
  const handleClaim = async () => {
    try {
      const id = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
      if (!id) {
        setShowRedAlert(true);
        setTimeout(() => setShowRedAlert(false), 2000);
        return;
      }
      setTelegramUserId(id);

      if (counter >= 0.4) {
        const userRef = doc(db, 'miningapp', id.toString());
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const currentBalance = userDoc.data().tonCoinBalance || 0;
          const newBalance = parseFloat(currentBalance) + parseFloat(counter);

          await updateDoc(userRef, {
            tonCoinBalance: parseFloat(newBalance.toFixed(9)),
            counter: 0,
            lastUpdated: new Date().toISOString(),
          });

          setTonBalance(newBalance);
          setCounter(0);

          // Clear localStorage mining data as counter reset
          localStorage.removeItem(LOCAL_STORAGE_KEY);

          setShowGreenAlert(true);
          setTimeout(() => setShowGreenAlert(false), 2000);

          await addDoc(collection(db, 'claims'), {
            userId: id,
            amount: counter,
            date: new Date().toISOString(),
            type: 'TON'
          });
        }
      } else {
        setShowRedAlert(true);
        setTimeout(() => setShowRedAlert(false), 2000);
      }
    } catch (error) {
      console.error("Claim failed:", error);
      setShowRedAlert(true);
      setTimeout(() => setShowRedAlert(false), 2000);
    }
  };

  const handleCloseModal = () => {
    setIsUpgradeModalVisible(false);
  };

  const handleUpgradeClick = () => {
    setIsUpgradeModalVisible(true);
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center pt-8 pb-[60px]">
        {showRedAlert && (
          <div className="fixed top-5 left-0 w-full flex items-center justify-center px-3">
            <div className="bg-red-500 text-white py-2 rounded-lg text-center px-4">
              <h1>Too small amount, minimum claim 0.4 TON</h1>
            </div>
          </div>
        )}
        {showGreenAlert && (
          <div className="fixed top-5 left-0 w-full flex items-center justify-center px-3">
            <div className="bg-green-500 text-white py-2 rounded-lg text-center px-4">
              <h1>Claim Successful</h1>
            </div>
          </div>
        )}
        <div className="relative flex justify-center items-center mt-1 w-4/5 bg-image">
          <img
            className="cursor-pointer w-[80%] rotate-animation"
            src={mainlogo}
            alt="main-img"
          />
          <img
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[15%]"
            src={overlayImage}
            alt="overlay-img"
          />
        </div>
        <div className="text-center">
          <h1 className="text-white text-[20px] font-bold mt-4">{counter.toFixed(9)} TON</h1>
          <h2 className="text-white text-[15px] py-1">Hashrate: {minerSpeed} Ghz</h2>
        </div>
        <div className="flex flex-row justify-between px-3 gap-4 w-full">
          <button 
            className="bg-zinc-900 text-[#00A9FF] rounded-lg px-8 py-4 flex-1 text-[12px] font-bold"
            onClick={handleClaim}
          >
            CLAIM TON
          </button>
          <button
            className="bg-[#00A9ff] text-white rounded-lg px-8 py-4 flex-1 text-[12px] font-bold"
            onClick={handleUpgradeClick}
          >
            UPGRADE MINER
          </button>
        </div>
      </div>
      <UpgradeMiner 
        isVisible={isUpgradeModalVisible} 
        onClose={handleCloseModal} 
      />
    </>
  );
};

export default Heading;

