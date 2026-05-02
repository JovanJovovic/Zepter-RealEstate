import { useState } from 'react';
import type { FormEvent } from 'react';
import { loginAdmin } from '../../api/admin';
import type { AdminUser } from '../../types/admin';

interface AdminLoginPageProps {
  onLogin: (admin: AdminUser) => void;
  navigate: (path: string) => void;
}

const AdminLoginPage = ({ onLogin, navigate }: AdminLoginPageProps) => {
  const [email, setEmail] = useState('admin@zepterrealestate.rs');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginAdmin(email, password);
      onLogin(response.admin);
      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prijava nije uspela.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <div className="admin-login-card__visual">
          <div className="admin-login-card__mark">ZRE</div>
          <span>Private admin console</span>
          <h1>Manage Zepter Real Estate portfolio with precision.</h1>
          <p>Update properties, publish development projects, upload media and review newsletter subscribers from one polished workspace.</p>
        </div>

        <form className="admin-login-form" onSubmit={submit}>
          <button type="button" className="admin-login-form__back" onClick={() => navigate('/')}>
            ← Back to website
          </button>
          <span className="admin-kicker">Secure access</span>
          <h2>Admin login</h2>
          <p>Use the seeded administrator account or any active admin created in MongoDB.</p>

          <label>
            Email address
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required />
          </label>

          <label>
            Password
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" required />
          </label>

          {error && <div className="admin-notice admin-notice--error">{error}</div>}

          <button className="admin-submit-button" disabled={loading} type="submit">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  );
};

export default AdminLoginPage;
