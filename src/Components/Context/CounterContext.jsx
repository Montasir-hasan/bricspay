import  { createContext, useContext, useState } from 'react';

const CounterContext = createContext();

export const useCounter = () => {
  return useContext(CounterContext);
};

export const CounterProvider = ({ children }) => {
  const [counter, setCounter] = useState(0.000000000);

  return (
    <CounterContext.Provider value={{ counter, setCounter }}>
      {children}
    </CounterContext.Provider>
  );
};
