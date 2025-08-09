import React, { useState } from 'react';
import UpgradeMiner from '../Components/modal/UpgradeMiner'; // ✅ Correct path

const Wallet = () => {
  const [isModalOpen, setIsModalOpen] = useState(true); // show modal on page load

  const handleClose = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 text-white">
      <h1 className="text-xl font-bold mb-4">Wallet Page</h1>

      {/* Optional: Button to reopen modal */}
      <button 
        onClick={() => setIsModalOpen(true)} 
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Open Upgrade Miner
      </button>

      {/* ✅ Show UpgradeMiner modal if isModalOpen is true */}
      <UpgradeMiner isVisible={isModalOpen} onClose={handleClose} />
    </div>
  );
};

export default Wallet;

