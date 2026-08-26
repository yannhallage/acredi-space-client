import { getFriendlyErrorMessage } from '../../shared/feedback';
import type { User } from '../../shared/types';

export type InvoiceStatus = 'paid' | 'pending' | 'failed';

export const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

export function getAvatarErrorMessage(error: unknown) {
  return getFriendlyErrorMessage(error, 'Impossible de mettre à jour la photo.');
}

export function formatProfileDate(value?: string) {
  if (!value) {
    return 'Non renseigne';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Non renseigne';
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatInviteRole(user: User) {
  if (user.adminRole === 'admin' || user.adminRole === 'owner') {
    return 'Admin';
  }

  if (user.adminRole === 'manager') {
    return 'Manager';
  }

  return 'Collaborateur';
}

export function isPendingInvitation(user: User) {
  return (user.invitationStatus ?? '').toUpperCase() === 'PENDING';
}

export function formatBillingDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatSubscriptionStatus(status: string) {
  if (status === 'active') {
    return 'Actif';
  }

  if (status === 'trial') {
    return 'Essai';
  }

  return 'En retard';
}

export function formatInvoiceStatus(status: InvoiceStatus) {
  if (status === 'paid') {
    return 'Payee';
  }

  if (status === 'pending') {
    return 'En attente';
  }

  return 'Echouee';
}
