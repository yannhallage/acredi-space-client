import type { User } from '../types';

const defaultAuthenticatedPath = '/app/dashboard';
const onboardingPathPrefix = '/onboarding/';
const signupOrganizationPath = '/signup/organization';
const signupSuccessPath = '/signup/success';

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

export function isSignupSuccessPath(path?: string | null) {
  return Boolean(path?.startsWith(signupSuccessPath));
}

/** Where to send a user who finished onboarding while still on an onboarding URL. */
export function getCompletedOnboardingExitPath(path?: string | null) {
  if (path?.startsWith(signupOrganizationPath) || isSignupSuccessPath(path)) {
    return signupSuccessPath;
  }

  return defaultAuthenticatedPath;
}

export function resolveAuthenticatedRedirect(
  user: Pick<User, 'onboardingStatus'> | null | undefined,
  fallbackPath = defaultAuthenticatedPath
) {
  const onboardingRedirectPath = getOnboardingRedirectPath(user?.onboardingStatus);

  if (onboardingRedirectPath) {
    return onboardingRedirectPath;
  }

  if (isSignupSuccessPath(fallbackPath)) {
    return signupSuccessPath;
  }

  return isOnboardingPath(fallbackPath) ? defaultAuthenticatedPath : fallbackPath;
}
