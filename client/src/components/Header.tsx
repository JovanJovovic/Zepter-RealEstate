import { useEffect, useState } from 'react';
import { languageOptions } from '../data/languages';
import { getCopy } from '../data/localization';
import type { SupportedLanguage } from '../types/property';
import { publicImage } from '../utils/asset';

interface HeaderProps {
  currentPath: string;
  navigate: (path: string) => void;
  language: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
}

const Header = ({ currentPath, navigate, language, onLanguageChange }: HeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const copy = getCopy(language);
  const navItems = [
    { label: copy.nav.home, path: '/' },
    { label: copy.nav.about, path: '/about' },
    { label: copy.nav.commercial, path: '/commercial' },
    { label: copy.nav.projects, path: '/projects-in-development' },
    { label: copy.nav.contact, path: '/contact' },
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

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <header className={`site-header ${isScrolled ? 'site-header--scrolled' : ''}`}>
      <div className="container header-inner">
        <button className="brand" onClick={() => handleNavigate('/')} aria-label={copy.nav.homeAria}>
          <img src={publicImage('ZepterRealEstateLogo.png')} alt="Zepter Real Estate" />
        </button>

        <nav className={`main-nav ${isOpen ? 'main-nav--open' : ''}`}>
          {navItems.map((item) => (
            <button
              key={item.path}
              className={currentPath === item.path ? 'nav-link nav-link--active' : 'nav-link'}
              onClick={() => handleNavigate(item.path)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="header-actions">
          <label className="language-select">
            <span>{copy.nav.language}</span>
            <select value={language} onChange={(event) => onLanguageChange(event.target.value as SupportedLanguage)}>
              {localizedLanguageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <button className="btn btn--small btn--primary" onClick={() => handleNavigate('/commercial')}>
            {copy.nav.viewProperties}
          </button>
          <button
            className={`menu-toggle ${isOpen ? 'menu-toggle--active' : ''}`}
            onClick={() => setIsOpen((value) => !value)}
            aria-label={copy.nav.toggleMenu}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
