import Footer from "../Components/Footer";
import { useNavigate } from 'react-router-dom';
import BackButton from '../Components/BackButton';
import { useShibCoin } from "../Components/Context/ShibCoinContext.jsx";
import '../App.css';
import { useState, useEffect } from 'react';
import { FaCheckCircle, FaAngleRight  } from 'react-icons/fa';
import shib from '../assets/shib.png';
import { doc, getDoc, updateDoc, increment } from "@firebase/firestore";
import { db } from '../database/firebase.js';

const Earn = () => {
  const navigate = useNavigate();
  const { setShibBalance } = useShibCoin();
  const [completedTasks, setCompletedTasks] = useState({
    twitter: false,
    telegramJoin: false,
    instagram: false,
    youtube: false,
  });
  const [userId, setUserId] = useState(null);
  const [remainingTasks, setRemainingTasks] = useState(0);

  useEffect(() => {
    const telegramUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
    if (telegramUserId) {
      setUserId(telegramUserId);
      fetchUserData(telegramUserId);
    }
  }, []);

  const fetchUserData = async (telegramUserId) => {
    try {
      const userDocRef = doc(db, 'miningapp', telegramUserId.toString());
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setShibBalance(userData.shibCoinBalance);
        setCompletedTasks(userData.completedTasks || {});
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    const totalTasks = tasks.length;
    const completedTaskCount = Object.values(completedTasks).filter(Boolean).length;
    setRemainingTasks(totalTasks - completedTaskCount);
  }, [completedTasks]);

  const handleBackButtonClick = () => {
    navigate('/'); 
  };

  const handleTaskClick = async (task, coins) => {
    if (!completedTasks[task]) {
      setShibBalance(prevBalance => prevBalance + coins);
      setCompletedTasks(prevTasks => ({
        ...prevTasks,
        [task]: true
      }));
      await updateDatabase(task, coins);
    }
  };

  const updateDatabase = async (task, coins) => {
    if (!userId) return;

    try {
      const userDocRef = doc(db, 'miningapp', userId.toString());
      await updateDoc(userDocRef, {
        shibCoinBalance: increment(coins),
        [`completedTasks.${task}`]: true
      });
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  const tasks = [
    { task: 'telegramJoin', link: 'https://t.me/+laGb7cp_p9MwZGM0', label: 'Join Telegram Earn', reward: 5000, requiredInvites: 0 },
    { task: 'twitter', link: '', label: 'Follow Twitter Earn', reward: 0, requiredInvites: 0 },
    { task: 'instagram', link: '', label: 'Follow Instagram Earn', reward: 0, requiredInvites: 0 },
    { task: 'youtube', link: '', label: 'Subscribe YouTube Earn', reward: 0, requiredInvites: 0 },
    
  ];

  return (
    <div className="w-full h-full min-h-screen bg-black pt-4">
      <BackButton navigateBack={handleBackButtonClick} />
      <div className="text-center items-center text-white font-robot ">
        <div className="flex justify-between px-4 gap-2 py-2">
          <div className="text-start">
            <h1>SHIB Earn</h1>
            <p className="text-[12px]">You will receive SHIB instantly after completing each task</p>
          </div>
          <img className="w-14 h-14" src={shib} alt="Shib" />
        </div>

        <div className="px-2 py-2 my-3 bg-zinc-900 flex justify-between rounded-lg mx-4">
          <h1>Task available</h1>
          <h1>{remainingTasks}</h1>
        </div>
        <div className="px-4">
          <h1 className="text-white text-start opacity-50">TASKs</h1>
        </div>
        {tasks.map(({ task, link, label, reward }) => (
          <div key={task} className="blurbox backdrop-blur-sm rounded-lg mx-4 mt-2 px-4 items-center text-start flex justify-between">
            <div>
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-white text-[13px] font-bold ${completedTasks[task] ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => handleTaskClick(task, reward)}
                disabled={completedTasks[task] }
              >
                {label}
              </a>
              <div className="flex items-center gap-2">
                <span className="text-white text-[11px]">+{reward}</span>
                <img className="w-4 h-4" src={shib} alt="coin-logo" />
              </div>
            </div>
            <div>
              {completedTasks[task] ? <FaCheckCircle className="text-green-500" /> : <FaAngleRight  className="text-white" />}
            </div>
          </div>
        ))}

        <div className="flex flex-col gap-4 mt-4"></div>
      </div>
      <Footer />
    </div>
  );
};

export default Earn;
