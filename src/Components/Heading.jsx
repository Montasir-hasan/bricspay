import { useState, useEffect, useRef } from "react";
import { doc, getDoc, updateDoc, collection, addDoc } from "@firebase/firestore";
import "animate.css";
import { db } from "../database/firebase";
import { useTonCoin } from "./Context/TonCoinContext.jsx";
import { useCounter } from '../Components/Context/CounterContext.jsx';

import mainlogo from '../assets/fan.png';
import overlayImage from '../assets/ton.png';
import UpgradeMiner from "./modal/UpgradeMiner.jsx";

const Heading = () => {
    const { setTonBalance } = useTonCoin();
    const { counter, setCounter } = useCounter();
    const [telegramUserId, setTelegramUserId] = useState(null);
    const [minerSpeed, setMinerSpeed] = useState(2); // Default Ghz
    const [showRedAlert, setShowRedAlert] = useState(false);
    const [showGreenAlert, setShowGreenAlert] = useState(false);
    const [isUpgradeModalVisible, setIsUpgradeModalVisible] = useState(false);

    // Using a ref to keep track of the last update time to avoid stale state in intervals
    const lastUpdateTimeRef = useRef(Date.now());

    // --- Step 1: Fetch initial user data ---
    // This effect runs only once to get the user's ID and initial data from Firebase.
    useEffect(() => {
        const fetchInitialData = async () => {
            const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
            if (userId) {
                setTelegramUserId(userId.toString());
                const userDocRef = doc(db, 'miningapp', userId.toString());
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    // Set initial values from the database
                    setTonBalance(userData.tonCoinBalance || 0);
                    setCounter(userData.counter || 0);
                    setMinerSpeed(userData.minerSpeed || 2);
                    // Set the last update time from DB or now if not present
                    lastUpdateTimeRef.current = userData.lastUpdateTime || Date.now();
                }
            }
        };

        fetchInitialData();
    }, [setTonBalance, setCounter]);


    // --- Step 2: Simulate Mining ---
    // This effect runs the mining simulation on the client side.
    useEffect(() => {
        if (!telegramUserId) return; // Don't start mining until we have a user ID

        const interval = setInterval(() => {
            const now = Date.now();
            const elapsedSeconds = (now - lastUpdateTimeRef.current) / 1000;
            
            // The formula is: dailyProfit = speed / 100
            // So, per-second profit is (speed / 100) / 86400 (seconds in a day)
            const minedPerSecond = (minerSpeed / 100) / 86400;
            const newMinedAmount = elapsedSeconds * minedPerSecond;

            setCounter(prevCounter => prevCounter + newMinedAmount);
            lastUpdateTimeRef.current = now; // Update the ref

        }, 1000); // Update the counter every second

        return () => clearInterval(interval); // Cleanup on component unmount
    }, [telegramUserId, minerSpeed, setCounter]);


    // --- Step 3: Periodically save progress to the database ---
    // This effect saves the counter to Firebase every 5 seconds to prevent data loss.
    useEffect(() => {
        if (!telegramUserId) return;

        const saveInterval = setInterval(async () => {
            if (counter > 0) { // Only update if there's something to save
                const userRef = doc(db, 'miningapp', telegramUserId);
                await updateDoc(userRef, {
                    counter: counter,
                    lastUpdateTime: Date.now() // Save the last update time
                }, { merge: true });
            }
        }, 5000); // Save every 5 seconds

        return () => clearInterval(saveInterval);
    }, [counter, telegramUserId]);


    // --- Step 4: Handle Claiming ---
    const handleClaim = async () => {
        if (telegramUserId && counter >= 0.4) {
            const userRef = doc(db, 'miningapp', telegramUserId);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                const currentBalance = userDoc.data().tonCoinBalance || 0;
                const newBalance = parseFloat(currentBalance) + parseFloat(counter);

                // Update database
                await updateDoc(userRef, {
                    tonCoinBalance: parseFloat(newBalance.toFixed(9)),
                    counter: 0 // Reset counter in DB
                });

                // Update local state
                setTonBalance(newBalance);
                setCounter(0.000000000);
                
                setShowGreenAlert(true);
                setTimeout(() => setShowGreenAlert(false), 2000);

                // Log the claim transaction
                await addDoc(collection(db, 'claims'), {
                    userId: telegramUserId,
                    amount: counter,
                    date: new Date().toISOString(),
                    type: 'TON'
                });
            }
        } else {
            setShowRedAlert(true);
            setTimeout(() => setShowRedAlert(false), 2000);
        }
    };

    const handleCloseModal = () => setIsUpgradeModalVisible(false);
    const handleUpgradeClick = () => setIsUpgradeModalVisible(true);

    return (
        <>
            <div className="flex flex-col items-center justify-center pt-8 pb-[60px]">
                {showRedAlert && (
                    <div className="fixed top-5 left-0 w-full flex items-center justify-center px-3 z-50">
                        <div className="bg-red-500 text-white py-2 rounded-lg text-center px-4">
                            <h1>Too small amount, minimum claim 0.4 TON</h1>
                        </div>
                    </div>
                )}
                {showGreenAlert && (
                    <div className="fixed top-5 left-0 w-full flex items-center justify-center px-3 z-50">
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
