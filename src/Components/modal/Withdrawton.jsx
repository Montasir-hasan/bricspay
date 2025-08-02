import { useState, useEffect } from 'react';
import logo from '../../assets/ton.png';
import { doc, getDoc, updateDoc, addDoc, collection } from "@firebase/firestore";
import { db } from "../../database/firebase.js";

const ModalTON = ({ isVisible, onClose, onMaxClick, amount, setAmount }) => {
  const [walletAddress, setWalletAddress] = useState('');
  const [tonCoinBalance, setTonCoinBalance] = useState(0);
  const [registrationDate, setRegistrationDate] = useState(null); 
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const telegramUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;

  useEffect(() => {
    const fetchUserData = async () => {
      if (telegramUserId) {
        try {
          const docRef = doc(db, 'miningapp', telegramUserId.toString());
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setTonCoinBalance(data.tonCoinBalance || 0);
            setWalletAddress(data.walletAddress || '');
            setRegistrationDate(new Date(data.registrationDate)); 
          } else {
            console.log('No such document!');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, [telegramUserId]);

  if (!isVisible) return null;

  const calculateBlocksPassed = () => {
    if (!registrationDate) return 0;
    const currentDate = new Date();
    const timeDiff = currentDate - registrationDate;
    const monthsPassed = timeDiff / (1000 * 60 * 60 * 24 * 30); 
    return Math.floor(monthsPassed);
  };

  const handleWithdraw = async () => {
    const blocksPassed = calculateBlocksPassed();

    if (!walletAddress) {
      showAlertMessage('Please Connect Wallet');
      return;
    }

    if (blocksPassed < 3) {
      showAlertMessage(`You can withdraw only after 3 blocks (90 days). You've completed ${blocksPassed} blocks.`);
      return;
    }

    const amountToWithdraw = parseFloat(amount);
    if (tonCoinBalance < 2 || amountToWithdraw < 2 || amountToWithdraw > tonCoinBalance) {
      showAlertMessage('Not Enough TON to Withdraw');
      return;
    }

    const newBalance = tonCoinBalance - amountToWithdraw;

    try {
      if (telegramUserId) {
        await updateDoc(doc(db, 'miningapp', telegramUserId.toString()), {
          tonCoinBalance: newBalance,
          lastWithdrawal: {
            amount: amountToWithdraw,
            date: new Date().toISOString(),
            walletAddress
          }
        });

        await addDoc(collection(db, 'withdrawals'), {
          userId: telegramUserId,
          amount: amountToWithdraw,
          date: new Date().toISOString(),
          type: 'TON'
        });

        showAlertMessage('Withdraw TON Successful');
        onClose();
      }
    } catch (error) {
      console.error('Error updating database:', error);
      showAlertMessage('Please try again.');
    }
  };

  const showAlertMessage = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
      setAlertMessage('');
    }, 2000);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 px-6">
      {showAlert && (
          <div className="fixed top-10 left-0 w-full flex items-center justify-center px-3">
            <div className={`bg-red-500 text-white py-2 rounded-lg text-center px-4`}>
              <h1>{alertMessage}</h1>
            </div>
          </div>
        )}
        <div className="bg-black rounded-lg border-zinc-900 border px-4 py-2">
          <img src={logo} alt="logo" className="w-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4 text-center text-white">Withdraw TON</h1>
          <p className="mb-4 text-center text-white"> You can withdraw your earnings after the 3rd Mining Block (90 days) finishes. Current Block: {calculateBlocksPassed()}</p>
          {!walletAddress ? (
            <div className="text-center text-red-500 mb-4">Connect your Wallet</div>
          ) : (
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="Your personal TON wallet address"
              className="w-full mb-4 p-2 bg-zinc-900 rounded-lg text-white"
            />
          )}
          <div className="relative w-full mb-4 p-2 bg-zinc-900 rounded-lg flex items-center">
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="bg-transparent flex-grow px-2 text-white"
            />
            <button
              onClick={onMaxClick}
              className="text-[#00A9FF] absolute right-2"
            >
              MAX
            </button>
          </div>
          <p className="mb-4 text-center text-[#00A9ff]">Network fee: 0.01 TON</p>
          <div className="flex flex-row justify-between px-3 gap-4 w-full">
            <button onClick={onClose} className="bg-zinc-900 text-[#00A9FF] rounded-lg px-8 py-2 flex-1 text-[12px] font-bold">Later</button>
            <button onClick={handleWithdraw} className="bg-[#00A9ff] text-white rounded-lg px-8 py-2 flex-1 text-[12px] font-bold">Send</button>
          </div>
        </div>
      </div>
      
    </>
  );
};

export default ModalTON;
