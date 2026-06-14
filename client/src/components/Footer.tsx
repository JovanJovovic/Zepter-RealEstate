import { getCopy } from '../data/localization';
import type { SupportedLanguage } from '../types/property';
import { publicImage } from '../utils/asset';

interface FooterProps {
  navigate: (path: string) => void;
  language: SupportedLanguage;
}

const Footer = ({ navigate, language }: FooterProps) => {
  const copy = getCopy(language);

  return (
    <footer className="site-footer">
      <div className="footer-pattern" />
      <div className="container footer-grid">
        <div className="footer-brand">
          <img src={publicImage('ZepterRealEstateLogo.png')} alt="Zepter Real Estate" />
          <p>{copy.footer.text}</p>
        </div>

        <div className="footer-column">
          <h3>{copy.footer.navigation}</h3>
          <button onClick={() => navigate('/')}>{copy.nav.home}</button>
          <button onClick={() => navigate('/about')}>{copy.nav.about}</button>
          <button onClick={() => navigate('/commercial')}>{copy.nav.commercial}</button>
          <button onClick={() => navigate('/projects-in-development')}>{copy.nav.projects}</button>
          <button onClick={() => navigate('/offer-property')}>{copy.nav.offerProperty}</button>
          <button onClick={() => navigate('/contact')}>{copy.nav.contact}</button>
        </div>

        <div className="footer-column">
          <h3>{copy.footer.contact}</h3>
          <a href="tel:+381698900003">+381 69 89 00 003</a>
          <a href="tel:+381112019170">+381 11 20 19 170</a>
          <a href="mailto:realestate@zepter.rs">realestate@zepter.rs</a>
          <span>Bulevar Mihaila Pupina 117, 11070 Novi Beograd</span>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>{copy.footer.copyright} {new Date().getFullYear()}.</span>
        <span>{copy.footer.rights}</span>
      </div>
    </footer>
  );
};

export default Footer;
