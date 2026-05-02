import type { ReactNode } from 'react';
import { languageOptions } from '../../data/languages';
import { getCopy } from '../../data/localization';
import type { AdminUser } from '../../types/admin';
import type { SupportedLanguage } from '../../types/property';

interface AdminShellProps {
  admin: AdminUser;
  currentPath: string;
  navigate: (path: string) => void;
  onLogout: () => void;
  language: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
  children: ReactNode;
}

const isActive = (currentPath: string, itemPath: string) => {
  if (itemPath === '/admin') return currentPath === '/admin' || currentPath === '/admin/';
  return currentPath.startsWith(itemPath);
};

const AdminShell = ({ admin, currentPath, navigate, onLogout, language, onLanguageChange, children }: AdminShellProps) => {
  const copy = getCopy(language).admin;
  const navItems = [
    { label: copy.common.dashboard, path: '/admin' },
    { label: copy.common.properties, path: '/admin/properties' },
    { label: copy.common.newsletter, path: '/admin/newsletter' },
  ];
  const localizedLanguageOptions =
    language === 'sr'
      ? [
          { value: 'en' as const, label: 'Engleski' },
          { value: 'sr' as const, label: 'Srpski' },
          { value: 'ru' as const, label: 'Ruski' },
          { value: 'de' as const, label: 'Nemački' },
        ]
      : languageOptions;

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <button className="admin-brand" onClick={() => navigate('/admin')}>
          <span>ZRE</span>
          <div>
            <strong>Zepter Real Estate</strong>
            <small>{copy.common.adminConsole}</small>
          </div>
        </button>

        <nav className="admin-nav" aria-label={copy.common.adminNavigation}>
          {navItems.map((item) => (
            <button
              key={item.path}
              className={isActive(currentPath, item.path) ? 'admin-nav__item admin-nav__item--active' : 'admin-nav__item'}
              onClick={() => navigate(item.path)}
            >
              <span>{item.label.slice(0, 1)}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <button className="admin-sidebar__public" onClick={() => navigate('/')}>
            {copy.common.viewPublicWebsite}
          </button>
          <div className="admin-user-card">
            <span>{admin.name.slice(0, 1).toUpperCase()}</span>
            <div>
              <strong>{admin.name}</strong>
              <small>{admin.role}</small>
            </div>
          </div>
          <button className="admin-logout" onClick={onLogout}>
            {copy.common.signOut}
          </button>
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="admin-kicker">{copy.common.portfolioManagement}</span>
            <h1>Zepter Real Estate CMS</h1>
          </div>
          <div className="admin-topbar__actions">
            <label className="admin-language-select">
              {copy.common.translationPreview}
              <select value={language} onChange={(event) => onLanguageChange(event.target.value as SupportedLanguage)}>
                {localizedLanguageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <button className="admin-topbar__public" onClick={() => navigate('/commercial')}>
              {copy.common.commercialPage}
            </button>
            <button className="admin-topbar__new" onClick={() => navigate('/admin/properties/new')}>
              {copy.common.newProperty}
            </button>
          </div>
        </header>
        {children}
      </section>
    </div>
  );
};

export default AdminShell;
