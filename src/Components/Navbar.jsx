import { useTonCoin } from "./Context/TonCoinContext";
import { useShibCoin } from "./Context/ShibCoinContext"; // Assuming you have this context too
import ton from '../assets/ton.png';
import shib from '../assets/shib.png';
import { useState, useEffect } from "react";

const Navbar = () => {
  const { tonBalance } = useTonCoin();
  const { shibBalance } = useShibCoin();

  const [tonPrice, setTonPrice] = useState(0);
  const [shibPrice, setShibPrice] = useState(0);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const tonResponse = await fetch('https://api.geckoterminal.com/api/v2/simple/networks/ton/token_price/EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c');
        const tonData = await tonResponse.json();
        const fetchedTonPrice = parseFloat(tonData.data.attributes.token_prices["EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c"]);
        setTonPrice(fetchedTonPrice);

        const shibResponse = await fetch('https://api.geckoterminal.com/api/v2/simple/networks/eth/token_price/0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce');
        const shibData = await shibResponse.json();
        const fetchedShibPrice = parseFloat(shibData.data.attributes.token_prices["0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce"]);
        setShibPrice(fetchedShibPrice);
      } catch (error) {
        console.error("Error fetching token prices:", error);
      }
    };

    fetchPrices();
  }, []);

  return (
    <nav className="bg-black p-4">
      <div className="container mx-auto flex justify-between items-center bg-zinc-900 py-2 px-3 rounded-xl">
        <div className="flex items-center gap-2">
          <img className="w-8" src={ton} alt="TON Logo" />
          <div>
            <h1 className="text-white font-bold text-sm">TON</h1>
            <div className="flex gap-2">
              <p className="text-white opacity-50 text-[10px]">{tonBalance.toFixed(4)} TON</p>
              <p className="text-white opacity-50 text-[10px]">${(tonBalance * tonPrice).toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <img className="w-8" src={shib} alt="SHIB Logo" />
          <div>
            <h1 className="text-white font-bold text-sm">SHIB</h1>
            <div className="flex gap-2">
              <p className="text-white opacity-50 text-[10px]">{shibBalance.toFixed(2)} SHIB</p>
              <p className="text-white opacity-50 text-[10px]">${(shibBalance * shibPrice).toFixed(6)}</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
