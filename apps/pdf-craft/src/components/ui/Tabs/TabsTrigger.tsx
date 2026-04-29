import { useTabs } from "./Tabs";

type TabsTriggerProps = {
  value: string;
  children: React.ReactNode;
}

export function TabsTrigger({ value, children }: TabsTriggerProps) {
  const { value: active, setValue } = useTabs();
  const isActive = active === value;

  return (
    <button
      onClick={() => setValue(value)}
      className={`tab-trigger ${isActive ? 'active' : ''}`}
      role='tab'
      aria-selected={isActive}
    >
      {children}
    </button>
  )
}