import { publicImage } from '../utils/asset';

interface FooterProps {
  navigate: (path: string) => void;
}

const Footer = ({ navigate }: FooterProps) => {
  return (
    <footer className="site-footer">
      <div className="footer-pattern" />
      <div className="container footer-grid">
        <div className="footer-brand">
          <img src={publicImage('ZepterRealEstateLogo.png')} alt="Zepter Real Estate" />
          <p>
            A leading comprehensive and regional real estate company by facilitating transactions that benefit all involved
            parties, resulting in client satisfaction and long-term relationships.
          </p>
        </div>

        <div className="footer-column">
          <h3>Navigation</h3>
          <button onClick={() => navigate('/')}>Home</button>
          <button onClick={() => navigate('/about')}>About</button>
          <button onClick={() => navigate('/commercial')}>Commercial</button>
          <button onClick={() => navigate('/projects-in-development')}>Project in Development</button>
          <button onClick={() => navigate('/contact')}>Contact</button>
        </div>

        <div className="footer-column">
          <h3>Contact</h3>
          <a href="tel:+381698900003">+381 69 89 00 003</a>
          <a href="tel:+381112019170">+381 11 20 19 170</a>
          <a href="mailto:realestate@zepter.rs">realestate@zepter.rs</a>
          <span>Bulevar Mihaila Pupina 117, 11070 Novi Beograd</span>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>Copyright © Zepter Real Estate {new Date().getFullYear()}.</span>
        <span>All rights reserved.</span>
      </div>
    </footer>
  );
};

export default Footer;
