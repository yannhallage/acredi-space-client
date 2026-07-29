import { useNavigate } from 'react-router-dom';
import { AcrediLockup, Card, Icon } from '../../shared/ui';
import { ChangePasswordForm } from './components/ChangePasswordForm';
import './change-password-page.css';

export function ChangePasswordPage() {
  const navigate = useNavigate();

  return (
    <main className="change-password-shell">
      <div className="change-password-page">
        <div className="change-password-brand">
          <AcrediLockup size={30} fontSize={22} />
        </div>

        <section className="page-header compact">
          <div>
            <button
              className="button ghost"
              type="button"
              onClick={() => navigate('/app/dashboard')}
            >
              <Icon name="arrowLeft" size={14} />
              Retour
            </button>
            <h1>Changer mon mot de passe</h1>
            <p>Protege ton compte en definissant un nouveau mot de passe.</p>
          </div>
        </section>

        <Card className="change-password-card" title="Securite du compte">
          <ChangePasswordForm />
        </Card>
      </div>
    </main>
  );
}
