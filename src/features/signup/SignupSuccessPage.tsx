import confetti from 'canvas-confetti';
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { getDefaultAllowedAppPath, usePermissions } from '../../shared/permissions';
import { useAuth } from '../../shared/context';
import { AcrediLockup } from '../../shared/ui';
import { AuthSubmitButton } from '../auth/components';

export function SignupSuccessPage() {
  const { isAuthenticated, user } = useAuth();
  const { permissionCodes } = usePermissions();
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);
  const homePath = getDefaultAllowedAppPath(permissionCodes) ?? '/app/dashboard';

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

  function handleGoHome() {
    if (leaving) {
      return;
    }
    setLeaving(true);
    window.setTimeout(() => {
      navigate(homePath);
    }, 200);
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.onboardingStatus === 'ORGANIZATION_SETUP_REQUIRED') {
    return <Navigate to="/signup/plans" replace />;
  }

  return (
    <div className="signup-success-page">
      <div className="signup-success-card">
        <img
          src="/success-org/success-avatar.png"
          alt=""
          className="signup-success-avatars"
          draggable={false}
        />
        <AcrediLockup size={36} fontSize={24} />
        <p className="eyebrow">Compte cree</p>
        <h1>Felicitations !</h1>
        <p className="muted">
          Votre compte et votre organisation sont prets. Vous pouvez maintenant inviter votre
          equipe et commencer a collaborer.
        </p>
        <AuthSubmitButton type="button" loading={leaving} onClick={handleGoHome}>
          Aller a l’accueil
        </AuthSubmitButton>
      </div>
    </div>
  );
}
