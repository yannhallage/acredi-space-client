import type { User } from '../types';

const defaultAuthenticatedPath = '/app/dashboard';
const onboardingPathPrefix = '/onboarding/';
const signupOrganizationPath = '/signup/organization';

const onboardingRedirects: Record<string, string> = {
  ORGANIZATION_SETUP_REQUIRED: signupOrganizationPath,
  PASSWORD_CHANGE_REQUIRED: '/onboarding/password-change',
  PASSWORD_REQUIRED_CHANGE: '/onboarding/password-change',
  PROFILE_COMPLETION_REQUIRED: '/onboarding/profile-completion',
};

export function getOnboardingRedirectPath(status?: string | null) {
  const normalizedStatus = status?.trim().toUpperCase();

  return normalizedStatus ? onboardingRedirects[normalizedStatus] ?? null : null;
}

export function isOnboardingPath(path?: string | null) {
  if (!path) {
    return false;
  }

  return path.startsWith(onboardingPathPrefix) || path.startsWith(signupOrganizationPath);
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
