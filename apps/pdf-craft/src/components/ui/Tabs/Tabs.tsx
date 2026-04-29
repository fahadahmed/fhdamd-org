'use client'

import { createContext, useContext, useState } from 'react'
import './tabs.css'

type TabsContextType = {
  value: string,
  setValue: (v: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

export function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs components must be used within <Tabs>');
  return ctx;
}

type TabProps = {
  defaultValue: string;
  children: React.ReactNode;
};

export function Tabs({ defaultValue, children }: TabProps) {
  const [value, setValue] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div>{children}</div>
    </TabsContext.Provider>
  )
}
