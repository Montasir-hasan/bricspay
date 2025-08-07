
import { BrowserRouter as Router, Route, Routes  } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Ref from './pages/Ref';
import Earn from './pages/Earn';
import Wallet from './pages/Wallet';


const AppRoutes = () => {
  return (
   
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/ref" element={<Ref />} />
      <Route path="/earn" element={<Earn />} />
      <Route path="/wallet" element={<Wallet />} />
    </Routes>
   
  );
};

export default AppRoutes;



