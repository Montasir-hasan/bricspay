import { useState, useEffect } from 'react';
import minerImage1 from '../../assets/miner-1.webp'; 
import minerImage2 from '../../assets/miner-2.webp';
import minerImage3 from '../../assets/miner-3.webp';
import minerImage4 from '../../assets/miner-4.webp';
import minerImage5 from '../../assets/miner-5.png';
import minerImage6 from '../../assets/miner-6.png';
import power from '../../assets/power.webp';
import { doc, getDoc, updateDoc } from "@firebase/firestore";
import { db } from "../../database/firebase";
import { TonConnectButton, useTonWallet, useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';

// Full UpgradeMiner component code here (remove isVisible, onClose props)
const UpgradeMiner = () => {
  // ... all your UpgradeMiner code here, but remove modal styles and isVisible check ...
  // (or keep them but pass isVisible={true} from Wallet)
  // Make sure it renders as a normal page section, NOT fixed modal.
  
  // For example, wrap return content in a normal div:
  // <div className="max-w-4xl mx-auto p-6 bg-black rounded-lg border border-zinc-900 text-white">...</div>

  // You can reuse all your logic here as-is
};

// Wallet component renders UpgradeMiner inside page
const Wallet = () => {
  return (
    <div className="p-4 text-white">
      <h1 className="text-xl font-bold mb-4">Wallet Page</h1>
      <UpgradeMiner />
    </div>
  );
};

export default Wallet;

