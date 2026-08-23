import type { User } from '../types';
import { signupOrganizationPath, signupPlansPath } from './signupPlan';

const defaultAuthenticatedPath = '/app/dashboard';
const onboardingPathPrefix = '/onboarding/';
const signupSuccessPath = '/signup/success';

const onboardingRedirects: Record<string, string> = {
  ORGANIZATION_SETUP_REQUIRED: signupPlansPath,
  PASSWORD_CHANGE_REQUIRED: '/onboarding/password-change',
  PASSWORD_REQUIRED_CHANGE: '/onboarding/password-change',
  PROFILE_COMPLETION_REQUIRED: '/onboarding/profile-completion',
};

export function isOrganizationSetupPath(path?: string | null) {
  if (!path) {
    return false;
  }

  return path.startsWith(signupPlansPath) || path.startsWith(signupOrganizationPath);
}

export function getOnboardingRedirectPath(status?: string | null) {
  const normalizedStatus = status?.trim().toUpperCase();

  return normalizedStatus ? onboardingRedirects[normalizedStatus] ?? null : null;
}

export function isAllowedOnboardingPath(status?: string | null, path?: string | null) {
  if (!path) {
    return false;
  }

  const homePath = getOnboardingRedirectPath(status);
  if (!homePath) {
    return false;
  }

  if (path.startsWith(homePath)) {
    return true;
  }

  const normalizedStatus = status?.trim().toUpperCase();
  if (normalizedStatus === 'ORGANIZATION_SETUP_REQUIRED') {
    return isOrganizationSetupPath(path) || isSignupSuccessPath(path);
  }

  return false;
}

export function isOnboardingPath(path?: string | null) {
  if (!path) {
    return false;
  }

  return path.startsWith(onboardingPathPrefix) || isOrganizationSetupPath(path);
}

export function isSignupSuccessPath(path?: string | null) {
  return Boolean(path?.startsWith(signupSuccessPath));
}

/** Where to send a user who finished onboarding while still on an onboarding URL. */
export function getCompletedOnboardingExitPath(path?: string | null) {
  if (isOrganizationSetupPath(path) || isSignupSuccessPath(path)) {
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
