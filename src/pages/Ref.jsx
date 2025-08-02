import Footer from "../Components/Footer";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../Components/BackButton';
import { db } from '../database/firebase.js';
import { collection, getDocs, doc, updateDoc, increment, getDoc } from "@firebase/firestore";
import { useTonCoin } from '../Components/Context/TonCoinContext.jsx';
import { FaCheckCircle } from 'react-icons/fa';
import invite from '../assets/invite.png';

const Ref = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [copied, setCopied] = useState(false);
  const [Idme, setIdme] = useState("");
  const [filteredUser, setFilteredUser] = useState([]);
  const { setTonBalance } = useTonCoin();
  const [activeTab, setActiveTab] = useState('invite');
  const [inviteLink, setInviteLink] = useState('');
  const [invitedUsers, setInvitedUsers] = useState(0);
  const [completedTasks, setCompletedTasks] = useState({
    invite3: false,
    invite5: false,
    invite10: false,
    invite20: false,
    invite50: false,
  });

  useEffect(() => {
    const telegramUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
    if (telegramUserId) {
      setIdme(telegramUserId);
      setInviteLink(`https://t.me/defi_ton_mining_bot?start=${telegramUserId}`);
    }
    fetchAllUserId();
    fetchUserData(telegramUserId);
  }, []);

  useEffect(() => {
    const telegramUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
    if (telegramUserId) {
      setIdme(telegramUserId);
    }

    const filtered = users.filter(
      (user) => user.referId === `${telegramUserId}`
    );
    setFilteredUser(filtered);

    const currentUser = users.find(user => user.chatId === telegramUserId);
    if (currentUser) {
      setTonBalance(currentUser.tonCoinBalance);
    }
  }, [Idme, users]);

  const fetchAllUserId = async () => {
    try {
      const userRef = collection(db, 'miningapp');
      const querySnapshot = await getDocs(userRef);
      const allUsers = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        allUsers.push(data);
      });

      setUsers(allUsers);
    } catch (error) {
      console.error("Error Fetching Users", error);
    }
  };

  const fetchUserData = async (telegramUserId) => {
    try {
      const userDocRef = doc(db, 'miningapp', telegramUserId.toString());
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setCompletedTasks(userData.completedTasks || {});
        setInvitedUsers(userData.invitedUsers || 0);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleBackButtonClick = () => {
    navigate('/'); 
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleTaskClick = async (task, coins) => {
    const taskRequirements = {
      invite3: 3,
      invite5: 5,
      invite10: 10,
      invite20: 20,
      invite50: 50,
    };

    if (invitedUsers < taskRequirements[task]) return;

    if (!completedTasks[task]) {
      setTonBalance(prevBalance => prevBalance + coins);
      setCompletedTasks(prevTasks => ({
        ...prevTasks,
        [task]: true
      }));
      await updateDatabase(task, coins);
    }
  };

  const updateDatabase = async (task, coins) => {
    if (!Idme) return;

    try {
      const userDocRef = doc(db, 'miningapp', Idme.toString());
      await updateDoc(userDocRef, {
        tonCoinBalance: increment(coins),
        [`completedTasks.${task}`]: true
      });
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  return (
    <div className="w-full h-full min-h-screen bg-black pt-3">
      <BackButton navigateBack={handleBackButtonClick} />

      <div className="text-center items-center text-white font-robot container mx-auto">
        <div className="flex justify-center gap-2 my-4 mx-3 py-2 px-2 rounded-lg bg-zinc-900">
          <button
            className={`flex-1 py-1 transition-all duration-300 rounded-lg ${activeTab === 'invite' ? 'bg-[#00A9FF] text-white shadow-lg transform scale-105' : 'bg-zinc-900 text-white'}`}
            onClick={() => setActiveTab('invite')}
          >
            Invite
          </button>
          <button
            className={`flex-1 py-1 transition-all duration-300 rounded-lg ${activeTab === 'reward' ? 'bg-[#00A9FF] text-white shadow-lg transform scale-105' : 'bg-zinc-900 text-white'}`}
            onClick={() => setActiveTab('reward')}
          >
            Reward
          </button>
        </div>

        {activeTab === 'invite' && (
          <>
            <div className="bg-zinc-900 backdrop-blur-sm rounded-lg mx-6 mt-4 h-24 py-4">
              <div className="flex flex-row justify-around">
                <h1 className="text-[20px] font-bold">Invite Link</h1>
                <button className="rounded-full bg-[#00A9FF] text-white px-2 font-bold" onClick={handleCopyLink}>
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              {Idme ? (
                <p className="py-2 text-center text-[13px] break-words">{inviteLink}</p>
              ) : (
                <p className="py-2 text-center">Loading your invite link...</p>
              )}
            </div>

            <div className="mt-3">
              <h1 className="text-white text-[20px] font-bold">Referrals ({filteredUser.length})</h1>

              <div className="container mt-4 text-start">
                {filteredUser.length > 0 ? (
                  <div className="scrollable-container border-solid border-[#FFFFFF47] border mx-5 rounded-lg">
                    {filteredUser.map((user, index) => (
                      <div key={index} className="text-white">
                        <div className="px-2 py-2 blurbox backdrop-blur-sm rounded-lg mx-4 mt-1">
                          <div className="flex justify-between items-center">
                            <div className="font-bold">Name: <span className="text-[#00A9FF]">{user.firstName}</span></div>
                            <div className="font-bold">TON: <span className="text-[#00A9FF]">{user.tonCoinBalance}</span></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white text-center">You have no Invite Friends.</p>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'reward' && (
          <div>
            {['invite3', 'invite5', 'invite10', 'invite20', 'invite50'].map((task, index) => (
              <div key={index} className="blurbox backdrop-blur-sm rounded-lg mx-6 mt-2 px-2 py-1 items-center text-start flex flex-row">
                <img className="w-8" src={invite} alt="invite-friend" />
                <a
                  href={inviteLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-[13px] py-2 ml-2 text-white ${completedTasks[task] ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => handleTaskClick(task, index === 0 ? 1 : index === 1 ? 2 : index === 2 ? 5 : index === 3 ? 20 : 100)}
                  disabled={completedTasks[task] || invitedUsers < (index === 0 ? 3 : index === 1 ? 5 : index === 2 ? 10 : index === 3 ? 20 : 50)}
                >
                  Invite {index === 0 ? 3 : index === 1 ? 5 : index === 2 ? 10 : index === 3 ? 20 : 50} Friends - <span className="text-[#00A9FF]"> Earn {index === 0 ? 1 : index === 1 ? 2 : index === 2 ? 5 : index === 3 ? 20 : 100} TON </span>
                </a>
                {completedTasks[task] && <FaCheckCircle className="text-green-500 ml-2" />}
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Ref;
