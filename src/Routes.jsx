import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Referral from './pages/Referral';
import Mission from './pages/Mission';
import History from './pages/History';
import Wallet from './pages/Wallet'; // ✅ Make sure this path is correct

import Footer from './Components/Footer'; // ✅ Your footer path

const AppRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ref" element={<Referral />} />
        <Route path="/earn" element={<Mission />} />
        <Route path="/about" element={<History />} />
        <Route path="/wallet" element={<Wallet />} /> {/* ✅ Wallet page */}
      </Routes>

      {/* ✅ Show Footer on all pages */}
      <Footer />
    </>
  );
};

export default AppRoutes;
