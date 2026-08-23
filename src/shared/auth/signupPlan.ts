const SIGNUP_PLAN_STORAGE_KEY = 'acredi-signup-plan-id';

export const signupPlansPath = '/signup/plans';
export const signupOrganizationPath = '/signup/organization';

export function getSignupPlanId() {
  const value = sessionStorage.getItem(SIGNUP_PLAN_STORAGE_KEY)?.trim();
  return value || null;
}

export function setSignupPlanId(planId: string) {
  sessionStorage.setItem(SIGNUP_PLAN_STORAGE_KEY, planId);
}

export function clearSignupPlanId() {
  sessionStorage.removeItem(SIGNUP_PLAN_STORAGE_KEY);
}
