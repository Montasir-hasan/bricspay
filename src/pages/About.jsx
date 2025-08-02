import Footer from "../Components/Footer";
import BackButton from "../Components/BackButton";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { db } from "../database/firebase.js";
import { collection, query, where, getDocs } from "@firebase/firestore";
import { formatDistanceToNow, parseISO } from "date-fns";
import { TbReceiptDollar } from "react-icons/tb";

const About = () => {
  const navigate = useNavigate();
  const [transactionHistory, setTransactionHistory] = useState([]);

  const handleBackButtonClick = () => {
    navigate("/");
  };

  useEffect(() => {
    const fetchTransactionHistory = async () => {
      const telegramUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;

      if (telegramUserId) {
        try {
          const claimsRef = collection(db, 'claims');
          const qClaims = query(claimsRef, where("userId", "==", telegramUserId));
          const claimsSnapshot = await getDocs(qClaims);
          const claimsHistory = claimsSnapshot.docs.map(doc => ({ ...doc.data(), type: 'Claim' }));

          const withdrawRef = collection(db, 'withdrawals');
          const qWithdraws = query(withdrawRef, where("userId", "==", telegramUserId));
          const withdrawsSnapshot = await getDocs(qWithdraws);
          const withdrawsHistory = withdrawsSnapshot.docs.map(doc => ({ ...doc.data(), type: 'Withdraw' }));

          const combinedHistory = [...claimsHistory, ...withdrawsHistory]
            .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sorting by date

          setTransactionHistory(combinedHistory);
        } catch (error) {
          console.error("Error fetching transaction history:", error);
        }
      }
    };

    fetchTransactionHistory();
  }, []);

  return (
    <div className="w-full h-full min-h-screen bg-black">
      <BackButton navigateBack={handleBackButtonClick} />
      <div className="container mx-auto px-4 py-6 ">
        <h1 className="text-white text-sm mb-4 opacity-50">TRANSACTION HISTORY</h1>
        <div className="bg-zinc-900 p-4 rounded-lg">
          {transactionHistory.length === 0 ? (
            <p className="text-white text-center">No transactions made yet.</p>
          ) : (
            <ul>
              {transactionHistory.map((transaction, index) => (
                <li key={index} className="text-white mb-4 flex justify-between">
                  <div className="flex flex-row items-center gap-2">
                    <div>
                      <TbReceiptDollar className="text-[#00A9ff] w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                      <span>{transaction.type}</span>
                      <span className="text-sm opacity-75">{formatDistanceToNow(parseISO(transaction.date))} ago</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span>{transaction.amount} {transaction.currency || 'TON'}</span>
                    <span className="text-sm opacity-75">
                      {transaction.type === 'Claim' ? 'Done' : 'Pending'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default About;
