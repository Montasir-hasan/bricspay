import { useTonCoin } from "./Context/TonCoinContext.jsx";
import { useShibCoin } from "./Context/ShibCoinContext.jsx";
import { useCounter } from "./Context/CounterContext.jsx";
import { useState, useEffect } from "react";
import { doc, onSnapshot, updateDoc } from "@firebase/firestore";
import { db } from "../database/firebase";

import tonIcon from '../assets/ton.png';
import shibIcon from '../assets/shib.png';
import ModalTON from './modal/Withdrawton.jsx';
import ModalSHIB from './modal/Withdrawshib.jsx';

const Navbar = () => {
  const { tonBalance, setTonBalance } = useTonCoin();
  const { shibBalance, setShibBalance } = useShibCoin();
  const { counter } = useCounter(); // live mining counter

  const [telegramUserId, setTelegramUserId] = useState(null);
  const [tonPrice, setTonPrice] = useState(0);
  const [shibPrice, setShibPrice] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [amount, setAmount] = useState('');

  // Fetch Telegram user ID
  useEffect(() => {
    const id = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
    if (id) setTelegramUserId(id);
  }, []);

  // Real-time Firestore listener for balances
  useEffect(() => {
    if (!telegramUserId) return;
    const userRef = doc(db, 'miningapp', telegramUserId.toString());
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTonBalance(data.tonCoinBalance || 0);
        setShibBalance(data.shibCoinBalance || 0);
      }
    });

    return () => unsubscribe();
  }, [telegramUserId, setTonBalance, setShibBalance]);

  // Fetch current prices
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const tonRes = await fetch('https://api.geckoterminal.com/api/v2/simple/networks/ton/token_price/EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c');
        const tonData = await tonRes.json();
        setTonPrice(parseFloat(tonData.data.attributes.token_prices["EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c"]));

        const shibRes = await fetch('https://api.geckoterminal.com/api/v2/simple/networks/eth/token_price/0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce');
        const shibData = await shibRes.json();
        setShibPrice(parseFloat(shibData.data.attributes.token_prices["0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce"]));
      } catch (err) {
        console.error("Price fetch error:", err);
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
    if (modalType === 'TON') setAmount((tonBalance + counter).toFixed(9));
    else if (modalType === 'SHIB') setAmount(shibBalance.toFixed(0));
  };

  const handleWithdraw = async () => {
    if (!telegramUserId) return;

    const userRef = doc(db, 'miningapp', telegramUserId.toString());
    const docSnap = await updateDoc(userRef); // fetch latest in Firestore
    const userDoc = await doc(db, 'miningapp', telegramUserId.toString());
    const userData = (await userDoc.get()).data();

    if (modalType === 'TON') {
      const newBalance = (userData.tonCoinBalance || 0) - parseFloat(amount);
      await updateDoc(userRef, { tonCoinBalance: newBalance });
      setTonBalance(newBalance);
    } else if (modalType === 'SHIB') {
      const newBalance = (userData.shibCoinBalance || 0) - parseFloat(amount);
      await updateDoc(userRef, { shibCoinBalance: newBalance });
      setShibBalance(newBalance);
    }

    setAmount('');
    setIsModalVisible(false);
  };

  return (
    <>
      <nav className="bg-black p-4">
        <div className="container mx-auto flex justify-between items-center bg-zinc-900 py-2 px-3 rounded-xl">
          {/* TON Section */}
          <div className="flex items-center gap-2">
            <img src={tonIcon} alt="TON" className="w-8" />
            <div>
              <h1 className="text-white font-bold text-sm">TON</h1>
              <div className="flex gap-2">
                <p className="text-white opacity-50 text-[10px]">
                  {(tonBalance + counter).toFixed(9)} TON
                </p>
                <p className="text-white opacity-50 text-[10px]">
                  ${( (tonBalance + counter) * tonPrice ).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          <button
            className="bg-[#00A9FF] px-3 py-1 text-white rounded-full text-[12px] font-bold"
            onClick={() => handleWithdrawClick('TON')}
          >
            Withdraw
          </button>
        </div>

        {/* SHIB Section */}
        <div className="container mx-auto flex justify-between items-center bg-zinc-900 py-2 px-3 rounded-xl mt-2">
          <div className="flex items-center gap-2">
            <img src={shibIcon} alt="SHIB" className="w-8" />
            <div>
              <h1 className="text-white font-bold text-sm">SHIB</h1>
              <div className="flex gap-2">
                <p className="text-white opacity-50 text-[10px]">
                  {shibBalance.toFixed(0)} SHIB
                </p>
                <p className="text-white opacity-50 text-[10px]">
                  ${(shibBalance * shibPrice).toFixed(6)}
                </p>
              </div>
            </div>
          </div>
          <button
            className="bg-[#00A9FF] px-3 py-1 text-white rounded-full text-[12px] font-bold"
            onClick={() => handleWithdrawClick('SHIB')}
          >
            Withdraw
          </button>
        </div>
      </nav>

      {/* Modals */}
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
