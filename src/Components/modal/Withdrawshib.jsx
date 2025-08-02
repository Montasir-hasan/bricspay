
import shib from '../../assets/shib.png';

const ModalSHIB = ({  isVisible, onClose, onMaxClick, amount, setAmount }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 px-6">
      <div className="bg-black rounded-lg border-zinc-900 border px-4  py-2">
        <img src={shib} alt="logo" className="w-16 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4 text-center text-white">Withdraw SHIB</h1>
        <p className="mb-4 text-center text-white">Enter your personal BEP-20 wallet address to withdraw your earnings</p>
        <p className="mb-4 text-center text-[#00A9ff]">Minimum amount 1000000 SHIB</p>
        <input type="text" placeholder="Your personal BEP-20 wallet address" className="w-full mb-4 p-2 bg-zinc-900 rounded-lg" />
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
            className="text-[#00A9FF]  absolute right-2"
          >
            MAX
          </button>
        </div>
        <p className="mb-4 text-center text-[#00A9ff]">Network fee: 58341 SHIB</p>
        <div className="flex flex-row justify-between px-3 gap-4 w-full">
          <button onClick={onClose} className="bg-zinc-900 text-[#00A9FF] rounded-lg px-8 py-2 flex-1 text-[12px] font-bold">Later</button>
          <button className="bg-[#00A9ff] text-white rounded-lg px-8 py-2 flex-1 text-[12px] font-bold">Send</button>
        </div>
      </div>
    </div>
  );
};

export default ModalSHIB;
