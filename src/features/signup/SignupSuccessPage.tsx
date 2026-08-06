import confetti from 'canvas-confetti';
import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { getDefaultAllowedAppPath, usePermissions } from '../../shared/permissions';
import { useAuth } from '../../shared/context';
import { AcrediLockup } from '../../shared/ui';

export function SignupSuccessPage() {
  const { isAuthenticated, user } = useAuth();
  const { permissionCodes } = usePermissions();
  const navigate = useNavigate();

  useEffect(() => {
    const end = Date.now() + 1800;
    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#5B6CFF', '#22C55E', '#F59E0B', '#EC4899'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#5B6CFF', '#22C55E', '#F59E0B', '#EC4899'],
      });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.onboardingStatus === 'ORGANIZATION_SETUP_REQUIRED') {
    return <Navigate to="/signup/organization" replace />;
  }

  const homePath = getDefaultAllowedAppPath(permissionCodes) ?? '/app/dashboard';

  return (
    <div className="signup-success-page">
      <div className="signup-success-card">
        <AcrediLockup size={36} fontSize={24} />
        <p className="eyebrow">Compte cree</p>
        <h1>Felicitations !</h1>
        <p className="muted">
          Votre compte et votre organisation sont prets. Vous pouvez maintenant inviter votre
          equipe et commencer a collaborer.
        </p>
        <button className="button primary button-wide" type="button" onClick={() => navigate(homePath)}>
          Aller a l’accueil
        </button>
      </div>
    </div>
  );
}
