import UpgradeMiner from '../Components/modal/UpgradeMiner';

const Wallet = () => {
  // no need for modal state if you want it always visible
  return (
    <div className="p-4 text-white">
      <h1 className="text-xl font-bold mb-4">Wallet Page</h1>

      <UpgradeMiner isVisible={true} onClose={() => {}} />
    </div>
  );
};

export default Wallet;
