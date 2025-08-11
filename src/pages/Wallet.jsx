import { useState, useEffect } from 'react';
import minerImage1 from '../assets/minerImage1'; 
import minerImage2 from '../assets/minerImage2';
import minerImage3 from '../assets/minerImage3';
import minerImage4 from '../assets/miner-4';
import minerImage5 from '../../assets/miner-5';
import minerImage6 from '../../assets/miner-6';
import power from '../assets/power';
import { doc, getDoc, updateDoc } from "@firebase/firestore";
import { db } from "../../database/firebase";
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

const UpgradeMiner = () => {
  const [selectedMiner, setSelectedMiner] = useState(miners[0]);
  const wallet = useTonWallet();
  const userAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();
  const recipientAddress = "UQBykGhRyRohbxDbtGrd7CWZAqgE0VIhObOq6lqlh1IdYblQ";
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
  }, [wallet, userAddress]);

  const toNano = (amount) => {
    return BigInt(Math.floor(amount * 1e9));
  };

  const transferTon = async (amount) => {
    if (!wallet) {
      setShowRedAlert(true);
      setTimeout(() => setShowRedAlert(false), 2000);
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
      setTimeout(() => setShowGreenAlert(false), 2000);

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
    transferTon(selectedMiner.price);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-black rounded-lg border border-zinc-900 text-white">
      {showGreenAlert && (
        <div className="mb-4 p-3 bg-green-600 rounded text-center font-bold">
          Successful Rented Miner
        </div>
      )}
      {showRedAlert && (
        <div className="mb-4 p-3 bg-red-600 rounded text-center font-bold">
          Please Connect Your TON Wallet
        </div>
      )}

      <h1 className="text-2xl font-bold mb-4 text-center">Upgrade Miner</h1>
      <p className="mb-6 text-center text-white">
        You will be able to earn approximately <span className='text-[#00A9FF] font-bold'>12%</span> profit per day and <span className='text-[#00A9FF] font-bold'>170%</span> profit in 30 days by renting a Turbo.
      </p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {miners.map((miner) => (
          <div
            key={miner.id}
            className={`border border-gray-700 py-2 rounded-lg cursor-pointer flex items-center gap-3 px-3
              ${selectedMiner.id === miner.id ? 'bg-[#00A9FF]' : ''}`}
            onClick={() => setSelectedMiner(miner)}
          >
            <img src={miner.image} alt={miner.name} className="w-10" />
            <div>
              <h2 className="text-white font-semibold text-sm">{miner.name}</h2>
              <div className='flex gap-2 items-center text-xs'>
                <p>{miner.speed} GH/s</p>
                <img className='w-4 h-4' src={power} alt="power icon" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedMiner && (
        <div className="space-y-2 mb-6">
          <div className="flex justify-between opacity-70 text-sm">
            <span>Minting Speed</span>
            <span>{selectedMiner.speed} GH/s</span>
          </div>
          <div className="flex justify-between opacity-70 text-sm">
            <span>Rent Period</span>
            <span>90 days</span>
          </div>
          <div className="flex justify-between opacity-70 text-sm">
            <span>Rent Price</span>
            <span>{selectedMiner.price} TON</span>
          </div>
          <div className="flex justify-between text-[#45AEF5] font-bold">
            <span>90 Days Profit 🔥</span>
            <span>{selectedMiner.monthlyProfit}</span>
          </div>
          <div className="flex justify-between text-[#45AEF5] font-bold">
            <span>Daily 🔥</span>
            <span>{selectedMiner.dailyProfit}</span>
          </div>
        </div>
      )}

      <div className="text-center mb-6">
        <p className="opacity-70">Total Renting Price</p>
        <h2 className="text-3xl font-bold">{selectedMiner.price} TON</h2>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={handleRentMiner}
          className="bg-[#00A9FF] hover:bg-[#008fcc] transition text-white px-6 py-3 rounded font-semibold"
        >
          Rent Miner
        </button>
      </div>

      <div className="mt-8 flex justify-center">
        <TonConnectButton />
      </div>
    </div>
  );
};

export default UpgradeMiner;

