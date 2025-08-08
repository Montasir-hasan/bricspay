
import './Components/amination.css'
import AppRoutes from './Routes';
import { TonCoinProvider } from './Components/Context/TonCoinContext';
import { ShibCoinProvider } from './Components/Context/ShibCoinContext';
import { CounterProvider } from './Components/Context/CounterContext';



export default function App() {
  return (
    <CounterProvider>    
      <TonCoinProvider>
    <ShibCoinProvider>
    <div className='bg-black  w-full '>
    <AppRoutes />
    </div>
    </ShibCoinProvider>
    </TonCoinProvider>
    </CounterProvider>

  )
}