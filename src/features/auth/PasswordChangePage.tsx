import { useAuth } from '../../shared/context';
import { PasswordChangeForm } from './components';

export function PasswordChangePage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return <PasswordChangeForm />;
}
