import { useState } from 'react';
import type { FormEvent } from 'react';
import { loginAdmin } from '../../api/admin';
import { getCopy } from '../../data/localization';
import type { AdminUser } from '../../types/admin';
import type { SupportedLanguage } from '../../types/property';

interface AdminLoginPageProps {
  onLogin: (admin: AdminUser) => void;
  navigate: (path: string) => void;
  language: SupportedLanguage;
}

const AdminLoginPage = ({ onLogin, navigate, language }: AdminLoginPageProps) => {
  const [email, setEmail] = useState('admin@zepterrealestate.rs');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const copy = getCopy(language).admin.login;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginAdmin(email, password);
      onLogin(response.admin);
      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.failed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <div className="admin-login-card__visual">
          <span>{copy.privateConsole}</span>
          <h1>{copy.title}</h1>
          <p>{copy.text}</p>
        </div>

        <form className="admin-login-form" onSubmit={submit}>
          <button type="button" className="admin-login-form__back" onClick={() => navigate('/')}>
            ← {copy.back}
          </button>
          <span className="admin-kicker">{copy.secureAccess}</span>
          <h2>{copy.heading}</h2>
          <p>{copy.help}</p>

          <label>
            {copy.email}
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required />
          </label>

          <label>
            {copy.password}
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" required />
          </label>

          {error && <div className="admin-notice admin-notice--error">{error}</div>}

          <button className="admin-submit-button" disabled={loading} type="submit">
            {loading ? copy.signingIn : copy.signIn}
          </button>
        </form>
      </section>
    </main>
  );
};

export default AdminLoginPage;
