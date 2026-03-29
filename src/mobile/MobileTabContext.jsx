import { createContext, useContext, useState, useRef } from 'react';

const TabContext = createContext();

export function TabProvider({ children }) {
  const [activeTab, setActiveTab] = useState('features');
  const scrollPositions = useRef({
    'features': 0,
    'pricing': 0,
    'home': 0,
    'account': 0,
  });
  const tabState = useRef({
    'features': {},
    'pricing': { yearly: false },
    'home': {},
    'account': {},
  });

  const saveScrollPosition = (tab, position) => {
    scrollPositions.current[tab] = position;
  };

  const getScrollPosition = (tab) => {
    return scrollPositions.current[tab] || 0;
  };

  const saveTabState = (tab, state) => {
    tabState.current[tab] = { ...tabState.current[tab], ...state };
  };

  const getTabState = (tab) => {
    return tabState.current[tab] || {};
  };

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab, saveScrollPosition, getScrollPosition, saveTabState, getTabState }}>
      {children}
    </TabContext.Provider>
  );
}

export function useTabContext() {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error('useTabContext must be used within TabProvider');
  }
  return context;
}