import { useEffect, useState } from 'react';
import { publicImage } from '../utils/asset';

const INTRO_DURATION_MS = 1450;
const REDUCED_MOTION_DURATION_MS = 1450;

const SiteIntro = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!isVisible) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = prefersReducedMotion ? REDUCED_MOTION_DURATION_MS : INTRO_DURATION_MS;
    const timer = window.setTimeout(() => setIsVisible(false), duration);

    return () => window.clearTimeout(timer);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="site-intro" aria-hidden="true">
      <div className="site-intro__frame">
        <svg
          className="site-intro__outline"
          viewBox="0 0 382 168"
          preserveAspectRatio="none"
          focusable="false"
        >
          <rect x="2" y="2" width="378" height="164" rx="20" ry="20" pathLength="1" />
        </svg>
        <img
          className="site-intro__logo"
          src={publicImage('ZepterRealEstateLogo.png')}
          alt=""
        />
      </div>
    </div>
  );
};

export default SiteIntro;
