import { useTonCoin } from "./Context/TonCoinContext.jsx";
import mainlogo from '../assets/fan.png';
import { useState, useEffect } from "react";
import '../App.css';
import { doc, getDoc, updateDoc, collection, addDoc } from "@firebase/firestore"; 
import { db } from "../database/firebase.js";
import "animate.css";
import overlayImage from '../assets/ton.png';
import UpgradeMiner from "./modal/UpgradeMiner.jsx";
import {useCounter} from '../Components/Context/CounterContext.jsx';

const Heading = () => {
  const { setTonBalance } = useTonCoin();
  const { counter, setCounter } = useCounter(); 
  const [telegramUserId, setTelegramUserId] = useState(null);
  const [minerSpeed, setMinerSpeed] = useState(2);
  const [showRedAlert, setShowRedAlert] = useState(false);
  const [showGreenAlert, setShowGreenAlert] = useState(false);
  const [isUpgradeModalVisible, setIsUpgradeModalVisible] = useState(false);

  useEffect(() => {
    const fetchCoinBalance = async () => {
      const telegramUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
      setTelegramUserId(telegramUserId);
  
      if (telegramUserId) {
        const userDoc = await getDoc(doc(db, 'miningapp', telegramUserId.toString()));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const currentBalance = userData.tonCoinBalance || 0;
          const currentCounter = userData.counter || 0; 
          const userMinerSpeed = userData.minerSpeed || 2; 
  
          setTonBalance(currentBalance);
          setCounter(currentCounter); 
          setMinerSpeed(userMinerSpeed); 
        }
      }
    };

    fetchCoinBalance();
    const interval = setInterval(fetchCoinBalance, 1000);

    return () => clearInterval(interval);
  }, [setTonBalance, setCounter]);



  const handleClaim = async () => {
    const telegramUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
    setTelegramUserId(telegramUserId);
    if (telegramUserId && counter >= 0.4) {
      const userRef = doc(db, 'miningapp', telegramUserId.toString());
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const currentBalance = userDoc.data().tonCoinBalance || 0;
        const newBalance = parseFloat(currentBalance) + parseFloat(counter);
        await updateDoc(userRef, { tonCoinBalance: parseFloat(newBalance.toFixed(9)), counter: 0 });
        setTonBalance(newBalance);
        setCounter(0.000000000); 
        setShowGreenAlert(true);
        setTimeout(() => {
          setShowGreenAlert(false);
        }, 2000);
        

        await addDoc(collection(db, 'claims'), {
          userId: telegramUserId,
          amount: counter,
          date: new Date().toISOString(),
          type: 'TON'
        });
      }
    } else {
      setShowRedAlert(true);
      setTimeout(() => {
        setShowRedAlert(false);
      }, 2000);
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
            <div className={`bg-red-500 text-white py-2 rounded-lg text-center px-4`}>
              <h1>Too small amount, minimum claim 0.4 TON</h1>
            </div>
          </div>
        )}
        {showGreenAlert && (
          <div className="fixed top-5 left-0 w-full flex items-center justify-center px-3">
            <div className={`bg-green-500 text-white py-2 rounded-lg text-center px-4`}>
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
          <button className="bg-[#00A9ff] text-white rounded-lg px-8 py-4 flex-1 text-[12px] font-bold" onClick={handleUpgradeClick}>UPGRADE MINER</button>
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
