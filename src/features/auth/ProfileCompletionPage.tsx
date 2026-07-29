import { useAuth } from '../../shared/context';
import { ProfileCompletionForm } from './components';

export function ProfileCompletionPage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return <ProfileCompletionForm />;
}
