import { createContext, useContext, useState } from 'react';

const CounterContext = createContext();

export const useCounter = () => {
  return useContext(CounterContext);
};

// This provider will now be managed by App.jsx
export const CounterProvider = ({ children }) => {
  const [counter, setCounter] = useState(0.000000000);
  const [minerSpeed, setMinerSpeed] = useState(2);
  const [telegramUserId, setTelegramUserId] = useState(null);

  const value = {
    counter,
    setCounter,
    minerSpeed,
    setMinerSpeed,
    telegramUserId,
    setTelegramUserId,
  };

  return (
    <CounterContext.Provider value={value}>
      {children}
    </CounterContext.Provider>
  );
};
