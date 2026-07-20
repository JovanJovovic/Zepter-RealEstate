import { useEffect, useState } from 'react';
import { languageOptions } from '../data/languages';
import { getCopy } from '../data/localization';
import { getArticleCopy } from '../data/articleCopy';
import type { SupportedLanguage } from '../types/property';
import { publicImage } from '../utils/asset';

type HeaderNavItem = {
  label: string;
  path?: string;
  anchor?: string;
};

interface HeaderProps {
  currentPath: string;
  navigate: (path: string) => void;
  language: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
}

const Header = ({ currentPath, navigate, language, onLanguageChange }: HeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const copy = getCopy(language);
  const articleCopy = getArticleCopy(language);
  const navItems: HeaderNavItem[] = [
    { label: copy.nav.home, path: '/' },
    { label: copy.nav.about, path: '/about' },
    { label: copy.nav.services, path: '/services' },
    { label: copy.nav.properties, path: '/commercial' },
    { label: copy.nav.offerProperty, path: '/offer-property' },
  ];
  const localizedLanguageOptions =
    language === 'sr'
      ? [
          { value: 'sr' as const, label: 'Srpski' },
          { value: 'en' as const, label: 'Engleski' },
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
    setIsMediaOpen(false);
  };

  const handleNavItem = (item: HeaderNavItem) => {
    if (item.anchor) {
      const targetAnchor = item.anchor;
      if (currentPath !== '/') {
        navigate('/');
        window.setTimeout(() => document.getElementById(targetAnchor)?.scrollIntoView({ behavior: 'smooth' }), 80);
      } else {
        document.getElementById(targetAnchor)?.scrollIntoView({ behavior: 'smooth' });
      }
      setIsOpen(false);
      return;
    }

    if (item.path) handleNavigate(item.path);
  };

  const isNavItemActive = (item: HeaderNavItem) => {
    if (!item.path) return false;
    if (item.path === '/services') {
      return currentPath === '/services' || currentPath.startsWith('/services/');
    }
    if (item.path === '/commercial') {
      return currentPath === '/commercial' || currentPath === '/projects-in-development' || currentPath.startsWith('/properties/');
    }
    return currentPath === item.path;
  };

  return (
    <header className={`site-header site-header--home ${isScrolled ? 'site-header--scrolled' : ''}`}>
      <div className="container header-inner">
        <button className="brand" onClick={() => handleNavigate('/')} aria-label={copy.nav.homeAria}>
          <img src={publicImage('ZepterRealEstateLogo.png')} alt="Zepter Real Estate" />
        </button>

        <nav className={`main-nav ${isOpen ? 'main-nav--open' : ''}`}>
          {navItems.map((item, index) => (
            <div className="main-nav__slot" key={item.path ?? item.anchor ?? item.label}>
              <button
                className={isNavItemActive(item) ? 'nav-link nav-link--active' : 'nav-link'}
                onClick={() => handleNavItem(item)}
              >
                {item.label}
              </button>
              {index === 3 && (
                <div className={`nav-dropdown ${isMediaOpen ? 'nav-dropdown--open' : ''}`}>
                  <button
                    className={currentPath.startsWith('/blog') || currentPath.startsWith('/news') ? 'nav-link nav-link--active nav-dropdown__trigger' : 'nav-link nav-dropdown__trigger'}
                    onClick={() => setIsMediaOpen((value) => !value)}
                    aria-haspopup="true"
                    aria-expanded={isMediaOpen}
                  >
                    {articleCopy.navGroup}
                    <span aria-hidden="true">⌄</span>
                  </button>
                  <div className="nav-dropdown__menu">
                    <button className={currentPath.startsWith('/blog') ? 'nav-dropdown__item nav-dropdown__item--active' : 'nav-dropdown__item'} onClick={() => handleNavigate('/blog')}>
                      Blog
                    </button>
                    <button className={currentPath.startsWith('/news') ? 'nav-dropdown__item nav-dropdown__item--active' : 'nav-dropdown__item'} onClick={() => handleNavigate('/news')}>
                      {articleCopy.news.title}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="header-actions">
          <a className="header-email" href="mailto:realestate@zepter.rs">realestate@zepter.rs</a>
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
          <button className="btn btn--small btn--primary" onClick={() => handleNavigate('/contact')}>
            {copy.nav.contactCta}
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
