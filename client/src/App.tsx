import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { getCurrentAdmin, logoutAdmin } from './api/admin';
import AdminShell from './components/admin/AdminShell';
import AssistantWidget from './components/AssistantWidget';
import Footer from './components/Footer';
import Header from './components/Header';
import LoadingState from './components/LoadingState';
import SiteIntro from './components/SiteIntro';
import { adminDefaultLanguage, normalizeLanguage } from './data/languages';
import { getCopy } from './data/localization';
import AboutPage from './pages/AboutPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminAssistantInquiriesPage from './pages/admin/AdminAssistantInquiriesPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminArticleEditorPage from './pages/admin/AdminArticleEditorPage';
import AdminArticlesPage from './pages/admin/AdminArticlesPage';
import AdminNewsletterPage from './pages/admin/AdminNewsletterPage';
import AdminPropertiesPage from './pages/admin/AdminPropertiesPage';
import AdminPropertyOfferDetailsPage from './pages/admin/AdminPropertyOfferDetailsPage';
import AdminPropertyOffersPage from './pages/admin/AdminPropertyOffersPage';
import AdminPropertyEditorPage from './pages/admin/AdminPropertyEditorPage';
import ContactPage from './pages/ContactPage';
import HomePage from './pages/HomePage';
import OfferPropertyPage from './pages/OfferPropertyPage';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailsPage from './pages/PropertyDetailsPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import ServicesPage from './pages/ServicesPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import ArticleListingPage from './pages/ArticleListingPage';
import type { AdminUser } from './types/admin';
import type { SupportedLanguage } from './types/property';

const normalizePath = (path: string) => {
  if (!path || path === '') return '/';
  return path.length > 1 ? path.replace(/\/$/, '') : path;
};

function App() {
  const [currentPath, setCurrentPath] = useState(() => normalizePath(window.location.pathname));
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [language, setLanguageState] = useState<SupportedLanguage>(() => normalizeLanguage(localStorage.getItem('zre_language')));
  const [adminLanguage, setAdminLanguageState] = useState<SupportedLanguage>(() =>
    normalizeLanguage(localStorage.getItem('zre_admin_language'), adminDefaultLanguage)
  );
  const adminCopy = getCopy(adminLanguage).admin;
  const isAdminPath = currentPath === '/admin' || currentPath.startsWith('/admin/');

  useEffect(() => {
    const handlePopState = () => setCurrentPath(normalizePath(window.location.pathname));
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    let mounted = true;

    getCurrentAdmin()
      .then((response) => {
        if (mounted) setAdmin(response.admin);
      })
      .catch(() => {
        if (mounted) setAdmin(null);
      })
      .finally(() => {
        if (mounted) setCheckingAdmin(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = isAdminPath ? adminLanguage : language;
  }, [adminLanguage, isAdminPath, language]);

  const navigate = (path: string) => {
    const normalized = normalizePath(path);
    window.history.pushState({}, '', normalized);
    setCurrentPath(normalized);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setLanguage = (nextLanguage: SupportedLanguage) => {
    localStorage.setItem('zre_language', nextLanguage);
    setLanguageState(nextLanguage);
  };

  const setAdminLanguage = (nextLanguage: SupportedLanguage) => {
    localStorage.setItem('zre_admin_language', nextLanguage);
    setAdminLanguageState(nextLanguage);
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setAdmin(null);
    navigate('/admin/login');
  };

  const adminPage = useMemo(() => {
    if (!isAdminPath) return null;

    if (checkingAdmin) {
      return (
        <main className="admin-loading-shell">
          <LoadingState text={adminCopy.common.loadingSession} />
        </main>
      );
    }

    if (currentPath === '/admin/login') {
      if (admin) return <AdminShell admin={admin} currentPath="/admin" navigate={navigate} onLogout={handleLogout} language={adminLanguage} onLanguageChange={setAdminLanguage}><AdminDashboardPage navigate={navigate} language={adminLanguage} /></AdminShell>;
      return <AdminLoginPage onLogin={setAdmin} navigate={navigate} language={adminLanguage} />;
    }

    if (!admin) {
      return <AdminLoginPage onLogin={setAdmin} navigate={navigate} language={adminLanguage} />;
    }

    let content = <AdminDashboardPage navigate={navigate} language={adminLanguage} />;

    if (currentPath === '/admin/properties') {
      content = <AdminPropertiesPage navigate={navigate} language={adminLanguage} />;
    } else if (currentPath === '/admin/articles') {
      content = <AdminArticlesPage navigate={navigate} language={adminLanguage} />;
    } else if (currentPath === '/admin/articles/new') {
      content = <AdminArticleEditorPage navigate={navigate} language={adminLanguage} />;
    } else if (currentPath.startsWith('/admin/articles/') && currentPath.endsWith('/edit')) {
      const articleId = decodeURIComponent(currentPath.replace('/admin/articles/', '').replace('/edit', ''));
      content = <AdminArticleEditorPage articleId={articleId} navigate={navigate} language={adminLanguage} />;
    } else if (currentPath === '/admin/properties/new') {
      content = <AdminPropertyEditorPage navigate={navigate} language={adminLanguage} />;
    } else if (currentPath.startsWith('/admin/properties/') && currentPath.endsWith('/edit')) {
      const propertyId = decodeURIComponent(currentPath.replace('/admin/properties/', '').replace('/edit', ''));
      content = <AdminPropertyEditorPage propertyId={propertyId} navigate={navigate} language={adminLanguage} />;
    } else if (currentPath === '/admin/newsletter') {
      content = <AdminNewsletterPage language={adminLanguage} />;
    } else if (currentPath === '/admin/inquiries') {
      content = <AdminAssistantInquiriesPage language={adminLanguage} />;
    } else if (currentPath === '/admin/property-offers') {
      content = <AdminPropertyOffersPage navigate={navigate} language={adminLanguage} />;
    } else if (currentPath.startsWith('/admin/property-offers/')) {
      const offerId = decodeURIComponent(currentPath.replace('/admin/property-offers/', ''));
      content = <AdminPropertyOfferDetailsPage offerId={offerId} navigate={navigate} language={adminLanguage} />;
    }

    return <AdminShell admin={admin} currentPath={currentPath} navigate={navigate} onLogout={handleLogout} language={adminLanguage} onLanguageChange={setAdminLanguage}>{content}</AdminShell>;
  }, [admin, adminCopy.common.loadingSession, adminLanguage, checkingAdmin, currentPath, isAdminPath]);

  const publicPage = useMemo(() => {
    if (currentPath === '/') return <HomePage navigate={navigate} language={language} />;
    if (currentPath === '/about') return <AboutPage language={language} />;
    if (currentPath === '/services') return <ServicesPage navigate={navigate} language={language} />;
    if (currentPath.startsWith('/services/')) {
      const serviceSlug = decodeURIComponent(currentPath.replace('/services/', ''));
      return <ServiceDetailPage slug={serviceSlug} navigate={navigate} language={language} />;
    }
    if (currentPath === '/blog') return <ArticleListingPage type="blog" navigate={navigate} language={language} />;
    if (currentPath.startsWith('/blog/')) {
      const articleSlug = decodeURIComponent(currentPath.replace('/blog/', ''));
      return <ArticleDetailPage type="blog" slug={articleSlug} navigate={navigate} language={language} />;
    }
    if (currentPath === '/news') return <ArticleListingPage type="news" navigate={navigate} language={language} />;
    if (currentPath.startsWith('/news/')) {
      const articleSlug = decodeURIComponent(currentPath.replace('/news/', ''));
      return <ArticleDetailPage type="news" slug={articleSlug} navigate={navigate} language={language} />;
    }
    if (currentPath === '/commercial') return <PropertiesPage navigate={navigate} mode="commercial" language={language} />;
    if (currentPath === '/projects-in-development') return <PropertiesPage navigate={navigate} mode="projects" language={language} />;
    if (currentPath === '/offer-property') return <OfferPropertyPage language={language} />;
    if (currentPath === '/contact') return <ContactPage language={language} />;

    if (currentPath.startsWith('/properties/')) {
      const publicId = decodeURIComponent(currentPath.replace('/properties/', ''));
      return <PropertyDetailsPage publicId={publicId} navigate={navigate} language={language} />;
    }

    return <PropertiesPage navigate={navigate} mode="commercial" language={language} />;
  }, [currentPath, language]);

  if (isAdminPath) {
    return <div className="app-shell app-shell--admin">{adminPage}</div>;
  }

  return (
    <div className="app-shell">
      <SiteIntro />
      <Header currentPath={currentPath} navigate={navigate} language={language} onLanguageChange={setLanguage} />
      {publicPage}
      <Footer navigate={navigate} language={language} />
      <AssistantWidget currentPath={currentPath} language={language} />
    </div>
  );
}

export default App;
