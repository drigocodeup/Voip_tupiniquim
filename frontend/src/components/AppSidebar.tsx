import { useAuth } from '../contexts/AuthContext';
import { useTheme } from './ThemeProvider';

export type NavSection = 'chat' | 'calls' | 'meet' | 'agenda' | 'contacts' | 'settings' | 'admin';

interface AppSidebarProps {
  active: NavSection;
  onNavigate: (section: NavSection) => void;
}

const navItems: Array<{ id: NavSection; label: string; icon: string; adminOnly?: boolean }> = [
  { id: 'chat', label: 'Atendimentos', icon: 'AT' },
  { id: 'calls', label: 'Chamadas', icon: 'CH' },
  { id: 'meet', label: 'Meet', icon: 'MT' },
  { id: 'agenda', label: 'Agenda', icon: 'AG' },
  { id: 'contacts', label: 'Contatos', icon: 'CT' },
  { id: 'settings', label: 'Config', icon: 'CF' },
  { id: 'admin', label: 'Admin', icon: 'AD', adminOnly: true },
];

export function AppSidebar({ active, onNavigate }: AppSidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const { isAdmin, currentUser } = useAuth();

  return (
    <aside className="app-sidebar" aria-label="Navegacao principal">
      <div className="sidebar-logo" title="VoipTupniquim">
        VT
      </div>

      <nav className="sidebar-nav">
        {navItems
          .filter((item) => !item.adminOnly || isAdmin)
          .map((item) => (
            <button
              key={item.id}
              className={`sidebar-button${active === item.id ? ' is-active' : ''}`}
              onClick={() => onNavigate(item.id)}
              title={item.label}
              aria-label={item.label}
              type="button"
            >
              <span>{item.icon}</span>
            </button>
          ))}
      </nav>

      <div className="sidebar-footer">
        <button
          className="sidebar-button"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
          aria-label={theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
          type="button"
        >
          {theme === 'dark' ? 'CL' : 'ES'}
        </button>

        <div className="sidebar-avatar" title={`${currentUser.name} (${isAdmin ? 'Admin' : 'Agente'})`}>
          {currentUser.name.charAt(0)}
        </div>
      </div>
    </aside>
  );
}
