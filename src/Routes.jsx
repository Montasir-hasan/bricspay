import { BrowserRouter as Router, Route, Routes  } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Ref from './pages/Ref';
import Earn from './pages/Earn';
import Wallet from './pages/Wallet'; // ✅ Make sure this path is correct
import Footer from './Components/Footer'; // ✅ Your footer path

const AppRoutes = () => {
  return (
    <>
      <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/ref" element={<Ref />} />
      <Route path="/earn" element={<Earn />} />
        <Route path="/wallet" element={<Wallet />} /> {/* ✅ Wallet page */}
      </Routes>

      {/* ✅ Show Footer on all pages */}
      <Footer />
    </>
  );
};

export default AppRoutes;

