import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { getCurrentAdmin, logoutAdmin } from './api/admin';
import AdminShell from './components/admin/AdminShell';
import Footer from './components/Footer';
import Header from './components/Header';
import LoadingState from './components/LoadingState';
import AboutPage from './pages/AboutPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminNewsletterPage from './pages/admin/AdminNewsletterPage';
import AdminPropertiesPage from './pages/admin/AdminPropertiesPage';
import AdminPropertyEditorPage from './pages/admin/AdminPropertyEditorPage';
import ContactPage from './pages/ContactPage';
import HomePage from './pages/HomePage';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailsPage from './pages/PropertyDetailsPage';
import type { AdminUser } from './types/admin';

const normalizePath = (path: string) => {
  if (!path || path === '') return '/';
  return path.length > 1 ? path.replace(/\/$/, '') : path;
};

function App() {
  const [currentPath, setCurrentPath] = useState(() => normalizePath(window.location.pathname));
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

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

  const navigate = (path: string) => {
    const normalized = normalizePath(path);
    window.history.pushState({}, '', normalized);
    setCurrentPath(normalized);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setAdmin(null);
    navigate('/admin/login');
  };

  const isAdminPath = currentPath === '/admin' || currentPath.startsWith('/admin/');

  const adminPage = useMemo(() => {
    if (!isAdminPath) return null;

    if (checkingAdmin) {
      return (
        <main className="admin-loading-shell">
          <LoadingState text="Checking admin session..." />
        </main>
      );
    }

    if (currentPath === '/admin/login') {
      if (admin) return <AdminShell admin={admin} currentPath="/admin" navigate={navigate} onLogout={handleLogout}><AdminDashboardPage navigate={navigate} /></AdminShell>;
      return <AdminLoginPage onLogin={setAdmin} navigate={navigate} />;
    }

    if (!admin) {
      return <AdminLoginPage onLogin={setAdmin} navigate={navigate} />;
    }

    let content = <AdminDashboardPage navigate={navigate} />;

    if (currentPath === '/admin/properties') {
      content = <AdminPropertiesPage navigate={navigate} />;
    } else if (currentPath === '/admin/properties/new') {
      content = <AdminPropertyEditorPage navigate={navigate} />;
    } else if (currentPath.startsWith('/admin/properties/') && currentPath.endsWith('/edit')) {
      const propertyId = decodeURIComponent(currentPath.replace('/admin/properties/', '').replace('/edit', ''));
      content = <AdminPropertyEditorPage propertyId={propertyId} navigate={navigate} />;
    } else if (currentPath === '/admin/newsletter') {
      content = <AdminNewsletterPage />;
    }

    return <AdminShell admin={admin} currentPath={currentPath} navigate={navigate} onLogout={handleLogout}>{content}</AdminShell>;
  }, [admin, checkingAdmin, currentPath, isAdminPath]);

  const publicPage = useMemo(() => {
    if (currentPath === '/') return <HomePage navigate={navigate} />;
    if (currentPath === '/about') return <AboutPage />;
    if (currentPath === '/commercial') return <PropertiesPage navigate={navigate} mode="commercial" />;
    if (currentPath === '/projects-in-development') return <PropertiesPage navigate={navigate} mode="projects" />;
    if (currentPath === '/contact') return <ContactPage />;

    if (currentPath.startsWith('/properties/')) {
      const publicId = decodeURIComponent(currentPath.replace('/properties/', ''));
      return <PropertyDetailsPage publicId={publicId} navigate={navigate} />;
    }

    return <PropertiesPage navigate={navigate} mode="commercial" />;
  }, [currentPath]);

  if (isAdminPath) {
    return <div className="app-shell app-shell--admin">{adminPage}</div>;
  }

  return (
    <div className="app-shell">
      <Header currentPath={currentPath} navigate={navigate} />
      {publicPage}
      <Footer navigate={navigate} />
    </div>
  );
}

export default App;
