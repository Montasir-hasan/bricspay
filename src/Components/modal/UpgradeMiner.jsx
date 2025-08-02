import { useState, useEffect } from 'react';
import minerImage1 from '../../assets/miner-1.webp'; 
import minerImage2 from '../../assets/miner-2.webp';
import minerImage3 from '../../assets/miner-3.webp';
import minerImage4 from '../../assets/miner-4.webp';
import minerImage5 from '../../assets/miner-5.png';
import minerImage6 from '../../assets/miner-6.png';
import power from '../../assets/power.webp';
import { doc, getDoc, updateDoc } from "@firebase/firestore";
import { db } from "../../database/firebase.js";
import { TonConnectButton, useTonWallet, useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';

const miners = [
  {
    id: 1,
    name: 'Free',
    speed: 2,
    price: 0,
    dailyProfit: '0.02 TON',
    monthlyProfit: '1.8 TON',
    image: minerImage1,
  },
  {
    id: 2,
    name: 'TON Silver',
    speed: 20,
    price: 1,
    dailyProfit: '0.2 TON',
    monthlyProfit: '18 TON',
    image: minerImage2,
  },
  {
    id: 3,
    name: 'TON Gold',
    speed: 100,
    price: 5,
    dailyProfit: '1 TON',
    monthlyProfit: '90 TON',
    image: minerImage3,
  },
  {
    id: 4,
    name: 'TON Diamond',
    speed: 600,
    price: 25,
    dailyProfit: '6 TON',
    monthlyProfit: '540 TON',
    image: minerImage4,
  },
  {
    id: 5,
    name: 'TON Platinum',
    speed: 1300,
    price: 50,
    dailyProfit: '13 TON',
    monthlyProfit: '1170 TON',
    image: minerImage5,
  },
  {
    id: 6,
    name: 'TON VIP',
    speed: 3000,
    price: 100,
    dailyProfit: '30 TON',
    monthlyProfit: '2700 TON',
    image: minerImage6,
  },
];

const UpgradeMiner = ({ isVisible, onClose }) => {
  const [selectedMiner, setSelectedMiner] = useState(miners[0]);
  const wallet = useTonWallet();
  const userAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();
  const recipientAddress = "UQABgC5XQOlTosmLBA5IcQDcKkI3E4zAlBqyYYn75dGC9fOm";
  const [showGreenAlert, setShowGreenAlert] = useState(false);
  const [showRedAlert, setShowRedAlert] = useState(false);

  const storeWalletAddress = async (walletAddress) => {
    const telegramUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
    if (telegramUserId) {
      try {
        await updateDoc(doc(db, 'miningapp', telegramUserId.toString()), {
          walletAddress: walletAddress
        }, { merge: true });
      } catch (error) {
        console.error('Error storing wallet address:', error);
      }
    }
  };

  useEffect(() => {
    if (wallet) {
      storeWalletAddress(userAddress);
    }
  }, [wallet]);

  if (!isVisible) return null;

  const handleMinerClick = (miner) => {
    setSelectedMiner(miner);
  };

  const toNano = (amount) => {
    return BigInt(Math.floor(amount * 1e9)); 
  };

  const transferTon = async (amount) => {
    if (!wallet) {
      alert("Please connect your wallet to proceed.");
      return;
    }

    try {
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600, 
        messages: [
          {
            address: recipientAddress, 
            amount: toNano(amount).toString(), 
            body: `Transfer ${amount} TON`
          }
        ]
      };

      await tonConnectUI.sendTransaction(transaction);
      
      setShowGreenAlert(true);
      setTimeout(() => {
        setShowGreenAlert(false);
      }, 2000);
      const telegramUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
      if (telegramUserId) {
        const userDoc = doc(db, 'miningapp', telegramUserId.toString());
        const userSnapshot = await getDoc(userDoc);

        if (userSnapshot.exists()) {
          const newCounter = selectedMiner.speed;

          await updateDoc(userDoc, {
            rentedMiner: selectedMiner.name,
            minerLevel: selectedMiner.id,
            rentEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), 
            counter: newCounter.toFixed(9),
            minerSpeed: selectedMiner.speed, 
          });
        } else {
          console.error("User document does not exist!");
        }
      }

    } catch (error) {
      console.error(`Transfer of ${amount} TON failed:`, error);
      alert(`Transfer of ${amount} TON failed. Please try again.`);
    }
  };

  const handleRentMiner = () => {
    if (!wallet) {
      setShowRedAlert(true);
      setTimeout(() => {
        setShowRedAlert(false);
      }, 2000);
      return;
    }
    transferTon(selectedMiner.price);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 px-3">
      {showGreenAlert && (
          <div className="fixed top-10 left-0 w-full flex items-center justify-center px-3">
            <div className={`bg-green-500 text-white py-2 rounded-lg text-center px-4`}>
              <h1>Successful Rented Miner</h1>
            </div>
          </div>
        )}
        {showRedAlert && (
          <div className="fixed top-10 left-0 w-full flex items-center justify-center px-3">
            <div className={`bg-red-500 text-white py-2 rounded-lg text-center px-4`}>
              <h1>Please Connect Your TON Wallet</h1>
            </div>
          </div>
        )}
      <div className="bg-black rounded-lg border-zinc-900 border px-4 py-6">
        <h1 className="text-xl font-bold mb-4 text-white text-center">Upgrade Miner</h1>
        <p className="mb-6 text-white">You will be able to earn approximately <span className='text-[#00A9FF] font-bold'>12%</span> profit per day and <span className='text-[#00A9FF] font-bold'>170%</span> profit in 30 days by renting a Turbo.</p>
        <div className="grid grid-cols-2 gap-2">
          {miners.map((miner) => (
            <div
              key={miner.id}
              className={`border border-gray-700 py-2 rounded-lg text-center flex flex-row items-center gap-2 px-2 cursor-pointer ${selectedMiner && selectedMiner.id === miner.id ? 'bg-[#00A9ff]' : ''}`}
              onClick={() => handleMinerClick(miner)}
            >
              <img src={miner.image} alt={miner.name} className="w-8" />
              <div>
                <h1 className="text-white text-start text-[12px] font-semibold">{miner.name}</h1>
                <div className='flex gap-2 items-center'>
                  <p className="text-white text-[12px] font-semibold">{miner.speed} GH/s</p>
                  <img className='w-4 h-4' src={power} alt="icon" />
                </div>
              </div>
            </div>
          ))}
        </div>
        {selectedMiner && (
          <div className='w-full py-3'>
            <div className='flex justify-between text-white'>
              <p className='opacity-50'>Minting Speed</p>
              <h1>{selectedMiner.speed} GH/s</h1>
            </div>
            <div className='flex justify-between text-white'>
              <p className='opacity-50'>Rent Period</p>
              <h1>90 days</h1>
            </div>
            <div className='flex justify-between text-white'>
              <p className='opacity-50'>Rent Price</p>
              <h1>{selectedMiner.price} TON</h1>
            </div>
            <div className='flex justify-between text-white'>
              <p className='text-[#45AEF5] font-bold'>90 Days Profit 🔥</p>
              <h1>{selectedMiner.monthlyProfit}</h1>
            </div>
            <div className='flex justify-between text-white'>
              <p className='text-[#45AEF5] font-bold'>Daily 🔥</p>
              <h1>{selectedMiner.dailyProfit}</h1>
            </div>
          </div>
          
        )}
        <div className='text-white'>
            <h1 className='opacity-50'>Total Renting Price</h1>
            <h1 className='text-center'>{selectedMiner.price} TON</h1>
        </div>
        <div className="flex flex-row justify-between px-3 gap-4 w-full mt-4">
          <button onClick={onClose} className="bg-zinc-900 text-[#00A9FF] rounded-lg px-8 py-2 flex-1 text-[12px] font-bold">Later</button>
          <button onClick={handleRentMiner} className="bg-[#00A9ff] text-white rounded-lg px-8 py-2 flex-1 text-[12px] font-bold">Rent Miner</button>
        </div>
        <div className="mt-4 justify-center items-center flex">
          <TonConnectButton />
        </div>
      </div>
    </div>
  );
};

export default UpgradeMiner;
