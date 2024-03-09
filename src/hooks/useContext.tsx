/**
 * @file useContext.txt 
 * @fileoverview contains the global variables and setters used throughout the application.
 */

import React from "react";

type Props = {
  children: React.ReactNode;
};

export type ContextType = {
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  showTabs: boolean;
  setShowTabs: React.Dispatch<React.SetStateAction<boolean>>;
};

export const Context = React.createContext<ContextType | null>(null);
export const ContextProvider = ({ children }: Props) => {
  const [darkMode, setDarkMode] = React.useState<boolean>(true);
  const [showTabs, setShowTabs] = React.useState<boolean>(false);

  const memoizedContextValue = React.useMemo(
    () => ({
      darkMode,
      setDarkMode,
      showTabs,
      setShowTabs,

    }),
    [darkMode, setDarkMode, showTabs, setShowTabs]
  );

  return (
    <Context.Provider value={memoizedContextValue} >
      {children}
    </Context.Provider>
  );
};

const useAppContext = () => {
  const context = React.useContext(Context);
  if (!context) {
    throw new Error("Context must be used within a Provider");
  }
  return context;
};

export default useAppContext;
