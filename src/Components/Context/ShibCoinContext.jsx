import { createContext, useState, useContext } from 'react';

const ShibCoinContext = createContext();

export const ShibCoinProvider = ({ children }) => {
  const [shibBalance, setShibBalance] = useState(0);

  return (
    <ShibCoinContext.Provider value={{ shibBalance, setShibBalance }}>
      {children}
    </ShibCoinContext.Provider>
  );
};

export const useShibCoin = () => {
  return useContext(ShibCoinContext);
};
