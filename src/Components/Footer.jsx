import { NavLink } from 'react-router-dom';
import { FaHome,  FaUserFriends, FaFileInvoiceDollar, FaClipboardList } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className='fixed bottom-0 left-0 w-full py-1 bg-zinc-900'>
      <div className="container mx-auto flex px-5">
        <div className=' flex justify-between items-center  py-2 w-full'>
          <NavLink 
            className={({ isActive }) => 
              `flex flex-col items-center text-center ${isActive ? 'text-[#00A9FF]' : 'text-white opacity-50'}`} 
            to="/"
          >
            <FaHome className=' w-6 h-6' />
            <span className='text-[12px] text-white mt-1 font-bold'>Home</span>
          </NavLink>
          <NavLink 
            className={({ isActive }) => 
              `flex flex-col items-center text-center ${isActive ? 'text-[#00A9FF]' : 'text-white opacity-50'}`} 
            to="/ref"
          >
            <FaUserFriends className='w-6 h-6' />
            <span className='text-[12px] text-white mt-1 font-bold'>Referral</span>
          </NavLink>
          
          <NavLink 
            className={({ isActive }) => 
              `flex flex-col items-center text-center ${isActive ? 'text-[#00A9FF]' : 'text-white opacity-50'}`} 
            to="/earn"
          >
            <FaClipboardList className='w-6 h-6' />
            <span className='text-[12px] text-white mt-1 font-bold'>Mission</span>
          </NavLink>
          
          <NavLink 
            className={({ isActive }) => 
              `flex flex-col items-center text-center ${isActive ? 'text-[#00A9FF]' : 'text-white opacity-50'}`} 
            to="/about"
          >
            <FaFileInvoiceDollar className=' w-6 h-6' />
            <span className='text-[12px] text-white mt-1 font-bold'>History</span>
          </NavLink>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
