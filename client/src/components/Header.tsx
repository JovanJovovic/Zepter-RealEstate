import { useEffect, useState } from 'react';
import { languageOptions } from '../data/languages';
import type { SupportedLanguage } from '../types/property';
import { publicImage } from '../utils/asset';

interface HeaderProps {
  currentPath: string;
  navigate: (path: string) => void;
  language: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
}

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Commercial', path: '/commercial' },
  { label: 'Project in Development', path: '/projects-in-development' },
  { label: 'Contact', path: '/contact' },
];

const Header = ({ currentPath, navigate, language, onLanguageChange }: HeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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
        <button className="brand" onClick={() => handleNavigate('/')} aria-label="Zepter Real Estate home">
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
            <span>Language</span>
            <select value={language} onChange={(event) => onLanguageChange(event.target.value as SupportedLanguage)}>
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <button className="btn btn--small btn--primary" onClick={() => handleNavigate('/commercial')}>
            View properties
          </button>
          <button
            className={`menu-toggle ${isOpen ? 'menu-toggle--active' : ''}`}
            onClick={() => setIsOpen((value) => !value)}
            aria-label="Toggle menu"
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
