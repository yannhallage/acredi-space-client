import type { User } from '../types';

const defaultAuthenticatedPath = '/app/dashboard';
const onboardingPathPrefix = '/onboarding/';

const onboardingRedirects: Record<string, string> = {
  PASSWORD_CHANGE_REQUIRED: '/onboarding/password-change',
  PASSWORD_REQUIRED_CHANGE: '/onboarding/password-change',
  PROFILE_COMPLETION_REQUIRED: '/onboarding/profile-completion',
};

export function getOnboardingRedirectPath(status?: string | null) {
  const normalizedStatus = status?.trim().toUpperCase();

  return normalizedStatus ? onboardingRedirects[normalizedStatus] ?? null : null;
}

export function isOnboardingPath(path?: string | null) {
  return Boolean(path?.startsWith(onboardingPathPrefix));
}

export function resolveAuthenticatedRedirect(
  user: Pick<User, 'onboardingStatus'> | null | undefined,
  fallbackPath = defaultAuthenticatedPath
) {
  const onboardingRedirectPath = getOnboardingRedirectPath(user?.onboardingStatus);

  if (onboardingRedirectPath) {
    return onboardingRedirectPath;
  }

  return isOnboardingPath(fallbackPath) ? defaultAuthenticatedPath : fallbackPath;
}
