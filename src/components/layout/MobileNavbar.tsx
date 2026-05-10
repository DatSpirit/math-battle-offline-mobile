import { NavLink, useLocation } from 'react-router-dom';
import { SwordIcon, ScrollIcon, LayersIcon, CartIcon, ClockIcon, BookOpenIcon } from '../shared/Icons';
import { useSound } from '../../hooks/useSound';

const NAV_ITEMS = [
  { name: 'Nhiệm Vụ', path: '/quests', icon: ScrollIcon },
  { name: 'Bộ Bài', path: '/decks', icon: LayersIcon },
  { name: 'Đấu', path: '/', icon: SwordIcon },
  { name: 'Số Học', path: '/summon', icon: BookOpenIcon },
  { name: 'Lịch Sử', path: '/history', icon: ClockIcon },
  { name: 'Shop', path: '/shop', icon: CartIcon },
];

const MobileNavbar: React.FC = () => {
  const { playSound } = useSound();
  const location = useLocation();
  const isSummon = location.pathname === '/summon';

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 px-2 pb-safe transition-all duration-300 ${isSummon ? 'bg-[#fcf9f2] border-t-4 border-white shadow-2xl' : 'hud-glass'}`}>
      <div className="flex items-center justify-around min-h-16 py-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={() => playSound('click')}
            className={({ isActive }) => `
              flex flex-col items-center justify-center gap-0.5 transition-all duration-300 relative px-2
              ${isActive ? 'text-primary scale-110' : 'text-gray-400 opacity-60'}
            `}
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-2xl transition-all ${isActive ? 'bg-primary/10 shadow-lg shadow-primary/10' : ''}`}>
                  <item.icon size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">{item.name}</span>
                {isActive && (
                    <div className="absolute -bottom-2 w-1 h-1 bg-primary rounded-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileNavbar;
