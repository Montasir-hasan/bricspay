import { useTonCoin } from "./Context/TonCoinContext";
import { useShibCoin } from "./Context/ShibCoinContext";
import ton from '../assets/ton.png';
import shib from '../assets/shib.png';
import ModalTON from './modal/Withdrawton';
import ModalSHIB from './modal/Withdrawshib';
import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "@firebase/firestore"; 
import { db } from "../database/firebase.js";

const Navbar = () => {
  const { tonBalance, setTonBalance } = useTonCoin();
  const { shibBalance, setShibBalance } = useShibCoin();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [amount, setAmount] = useState('');
  const [telegramUserId, setTelegramUserId] = useState(null);
  const [tonPrice, setTonPrice] = useState(0);
  const [shibPrice, setShibPrice] = useState(0);

  useEffect(() => {
    const fetchBalances = async () => {
      const telegramUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
      setTelegramUserId(telegramUserId);

      if (telegramUserId) {
        const userRef = doc(db, 'miningapp', telegramUserId.toString());
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setTonBalance(userData.tonCoinBalance || 0);
          setShibBalance(userData.shibCoinBalance || 0);
        }
      }
    };

    fetchBalances();
  }, [setTonBalance, setShibBalance]);


  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const tonResponse = await fetch('https://api.geckoterminal.com/api/v2/simple/networks/ton/token_price/EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c');
        const tonData = await tonResponse.json();
        const tonPrice = parseFloat(tonData.data.attributes.token_prices["EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c"]);
        setTonPrice(tonPrice);

        const shibResponse = await fetch('https://api.geckoterminal.com/api/v2/simple/networks/eth/token_price/0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce');
        const shibData = await shibResponse.json();
        const shibPrice = parseFloat(shibData.data.attributes.token_prices["0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce"]);
        setShibPrice(shibPrice);
      } catch (error) {
        console.error("Error fetching prices:", error);
      }
    };

    fetchPrices();
  }, []);



  const handleWithdrawClick = (type) => {
    setModalType(type);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setModalType('');
  };

  const handleMaxClick = () => {
    if (modalType === 'TON') {
      setAmount(tonBalance.toFixed(4));
    } else if (modalType === 'SHIB') {
      setAmount(shibBalance.toFixed(0));
    }
  };

  const handleWithdraw = async () => {
    if (telegramUserId) {
      const userRef = doc(db, 'miningapp', telegramUserId.toString());
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (modalType === 'TON') {
          const newBalance = userData.tonCoinBalance - parseFloat(amount);
          await updateDoc(userRef, { tonCoinBalance: newBalance });
          setTonBalance(newBalance);
        } else if (modalType === 'SHIB') {
          const newBalance = userData.shibCoinBalance - parseFloat(amount);
          await updateDoc(userRef, { shibCoinBalance: newBalance });
          setShibBalance(newBalance);
        }
        setIsModalVisible(false);
        setAmount('');
      }
    }
  };

  return (
    <>
      <nav className="bg-black p-4">
        <div className="container mx-auto flex justify-between items-center bg-zinc-900 py-2 px-3 rounded-xl">
          <div className="flex items-center gap-2">
            <img className="w-8" src={ton} alt="logo" />
            <div>
              <h1 className="text-white font-bold text-sm">TON</h1>
              <div className='flex gap-2'>
                <p className='text-white opacity-50 text-[10px]'>
                  {tonBalance.toFixed(4)} TON
                </p>
                <p className='text-white opacity-50 text-[10px]'>
                ${(tonBalance * tonPrice).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          <div>
            <button 
              className='bg-[#00A9FF] px-3 py-1 text-white rounded-full text-[12px] font-bold'
              onClick={() => handleWithdrawClick('TON')}
            >
              Withdraw
            </button>
          </div>
        </div>
        <div className="container mx-auto flex justify-between items-center bg-zinc-900 py-2 px-3 rounded-xl mt-2">
          <div className="flex items-center gap-2">
            <img className="w-8" src={shib} alt="logo" />
            <div>
              <h1 className="text-white font-bold text-sm">SHIB</h1>
              <div className='flex gap-2'>
                <p className='text-white opacity-50 text-[10px]'>
                  {shibBalance.toFixed(2)} SHIB
                </p>
                <p className='text-white opacity-50 text-[10px]'>
                ${(shibBalance * shibPrice).toFixed(6)}
                </p>
              </div>
            </div>
          </div>
          <div>
            <button 
              className='bg-[#00A9FF] px-3 py-1 text-white rounded-full text-[12px] font-bold'
              onClick={() => handleWithdrawClick('SHIB')}
            >
              Withdraw
            </button>
          </div>
        </div>
      </nav>
      <ModalTON 
        isVisible={isModalVisible && modalType === 'TON'} 
        onClose={handleCloseModal} 
        onMaxClick={handleMaxClick}
        amount={amount}
        setAmount={setAmount}
        handleWithdraw={handleWithdraw}
      />
      <ModalSHIB
        isVisible={isModalVisible && modalType === 'SHIB'} 
        onClose={handleCloseModal} 
        onMaxClick={handleMaxClick}
        amount={amount}
        setAmount={setAmount}
        handleWithdraw={handleWithdraw}
      />
    </>
  );
};

export default Navbar;
