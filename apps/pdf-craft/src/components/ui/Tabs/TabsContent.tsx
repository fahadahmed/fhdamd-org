import { useTabs } from "./Tabs";

type TabsContentProps = {
  value: string;
  children: React.ReactNode;
};

export function TabsContent({ value, children }: TabsContentProps) {
  const { value: active } = useTabs();

  if (active !== value) return null;

  return <div className="tab-content">{children}</div>
}