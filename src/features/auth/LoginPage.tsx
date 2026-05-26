import { FormEvent, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/context';
import { AcrediLockup, Icon } from '../../shared/ui';

export function LoginPage() {
  const { isAuthenticated, login, loading } = useAuth();
  const [email, setEmail] = useState('mohamed@acredispace.local');
  const [password, setPassword] = useState('demo-acredi');
  const [submitting, setSubmitting] = useState(false);
  const [Message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/app/dashboard';

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  //   event.preventDefault();
  //   setSubmitting(true);
  //   const response = await login(email, password);
  //    navigate('/verify-otp');
  //   setSubmitting(false);
  //   navigate(redirectTo, { replace: true });
  // }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSubmitting(true);

      const response = await login(email, password);

      // exemple :
      // response.data.challengeId
      // response.data.email

      navigate("/verify-otp");
    } catch (error: any) {
      console.error(error);
      setMessage(error?.message || "Connexion échouée");
      // ici toast / notification
      // toast.error(error?.response?.data?.message || "Connexion échouée");

    } finally {
      setSubmitting(false);
    }
  }
  return (
    <div className="login-card">
      <div className="login-mobile-brand">
        <AcrediLockup size={30} fontSize={22} />
      </div>
      <div>
        <p className="eyebrow">Connexion securisee</p>
        <h1>Ravi de vous revoir.</h1>
        <p className="muted">Connectez-vous a votre espace pour retrouver fichiers, messages et reunions.</p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <label>
          <span>Email professionnel</span>
          <span className="input-wrap">
            <Icon name="mail" size={16} />
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
          </span>
        </label>
        <label>
          <span>Mot de passe</span>
          <span className="input-wrap">
            <Icon name="lock" size={16} />
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
          </span>
        </label>
        <div className="login-row">
          <label className="check-row">
            <input type="checkbox" defaultChecked />
            Rester connecte
          </label>
          <Link to="/login">Mot de passe oublie ?</Link>
        </div>
        {Message && <p className="error text-red-700">{Message}</p>}
        <button className="button primary button-wide" type="submit" disabled={submitting || loading}>
          {submitting ? 'Connexion...' : 'Entrer dans Acredi Space'}
          <Icon name="arrowRight" size={16} />
        </button>
      </form>

      <p className="login-footnote">Compte demo pre-rempli. Aucun backend reel n est appele.</p>
    </div>
  );
}
