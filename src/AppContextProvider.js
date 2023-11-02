import { createContext, useContext } from "react";

const AppContext = createContext(null);

export const AppContextProvider = ({children}) => {

    const value = {};
  
    return (
      <AppContext.Provider value={value}>
        {children}
      </AppContext.Provider>
    );
  };

export const useAppContext = () => {
  return useContext(AppContext);
};

