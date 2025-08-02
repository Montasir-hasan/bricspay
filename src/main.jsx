import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import WebApp from '@twa-dev/sdk';
import LoadingScreen from './Components/Loader.jsx'



const Main = () => {
  const [isLoading, setIsLoading] = useState(LoadingScreen);

  useEffect(() => {
        if (window.Telegram && window.Telegram.WebApp) {
          setIsLoading(true)
          setTimeout(() => setIsLoading(false), 3000);
          WebApp.ready();
          WebApp.expand();
          WebApp.enableClosingConfirmation()
          
        } 
      
  }, []);



  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <TonConnectUIProvider manifestUrl='your App url here /tonconnect-manifest.json'>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </TonConnectUIProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<Main />);
