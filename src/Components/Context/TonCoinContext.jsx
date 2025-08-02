import  { createContext, useState, useContext } from 'react';

const TonCoinContext = createContext();

export const TonCoinProvider = ({ children }) => {
  const [tonBalance, setTonBalance] = useState(0);

  return (
    <TonCoinContext.Provider value={{ tonBalance, setTonBalance }}>
      {children}
    </TonCoinContext.Provider>
  );
};

export const useTonCoin = () => {
  return useContext(TonCoinContext);
};
