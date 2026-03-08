import { Shield, Car, Search, User } from 'lucide-react';

type Tab = 'scans' | 'cars' | 'compare' | 'account';

interface BottomTabBarProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const tabs: { id: Tab; icon: typeof Shield; label: string }[] = [
  { id: 'scans', icon: Shield, label: 'Scans' },
  { id: 'cars', icon: Car, label: 'Cars' },
  { id: 'compare', icon: Search, label: 'Compare' },
  { id: 'account', icon: User, label: 'Account' },
];

const BottomTabBar = ({ active, onChange }: BottomTabBarProps) => (
  <nav
    className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-border"
    style={{ paddingBottom: 'max(6px, env(safe-area-inset-bottom))' }}
  >
    <div className="flex">
      {tabs.map(({ id, icon: Icon, label }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className="flex-1 flex flex-col items-center py-2 min-h-[48px] relative"
          >
            {isActive && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-gold" />
            )}
            <Icon
              size={20}
              className={isActive ? 'text-gold' : 'text-muted-custom opacity-45'}
            />
            <span
              className={`text-[10px] mt-0.5 font-body font-semibold ${
                isActive ? 'text-gold' : 'text-muted-custom opacity-45'
              }`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  </nav>
);

export default BottomTabBar;
