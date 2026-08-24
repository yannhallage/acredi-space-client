import { HttpError } from './api/http';

export type FeedbackTone = 'error' | 'warning' | 'success';

export type Feedback = {
  tone: FeedbackTone;
  title: string;
  description: string;
};

const GENERIC_SERVER_MESSAGES = [
  'unexpected server error',
  'internal server error',
  'internal error',
  'une erreur est survenue pendant la requete',
  'une erreur est survenue pendant la requête',
];

export function feedback(
  tone: FeedbackTone,
  title: string,
  description: string
): Feedback {
  return { tone, title, description };
}

export function validationFeedback(
  description: string,
  title = 'Informations incomplètes'
): Feedback {
  return feedback('warning', title, description);
}

function extractErrorText(error: unknown) {
  const parts = [
    error instanceof Error ? error.message : '',
    error instanceof HttpError && typeof error.payload?.message === 'string'
      ? error.payload.message
      : '',
    error instanceof HttpError && typeof error.payload?.error === 'string'
      ? error.payload.error
      : '',
  ];

  return parts.join(' ').trim();
}

function isGenericServerError(error: unknown) {
  const text = extractErrorText(error).toLowerCase();

  if (!text) {
    return false;
  }

  return GENERIC_SERVER_MESSAGES.some((needle) => text.includes(needle));
}

function usefulErrorMessage(error: unknown) {
  const message = extractErrorText(error);

  if (!message || isGenericServerError(error)) {
    return null;
  }

  return message;
}

const SERVICE_UNAVAILABLE = feedback(
  'error',
  'Service indisponible',
  'Nous n’avons pas pu joindre le serveur. Réessayez dans un moment.'
);

function tryResolveTransportFeedback(error: unknown): Feedback | null {
  if (error instanceof TypeError) {
    return feedback(
      'error',
      'Connexion réseau interrompue',
      'Vérifiez votre connexion internet, puis réessayez.'
    );
  }

  if (error instanceof HttpError) {
    if (error.status === 429) {
      return feedback(
        'warning',
        'Trop de tentatives',
        'Par sécurité, patientez quelques instants avant une nouvelle tentative.'
      );
    }

    if (error.status >= 500) {
      return SERVICE_UNAVAILABLE;
    }
  }

  if (isGenericServerError(error)) {
    return SERVICE_UNAVAILABLE;
  }

  return null;
}

export function resolveNetworkFeedback(error: unknown, fallback: Feedback): Feedback {
  return tryResolveTransportFeedback(error) ?? fallback;
}

export function resolveActionFeedback(error: unknown, fallback: Feedback): Feedback {
  const transportFeedback = tryResolveTransportFeedback(error);

  if (transportFeedback) {
    return transportFeedback;
  }

  if (error instanceof HttpError) {
    if (error.status === 401) {
      return feedback(
        'warning',
        'Session expirée',
        'Reconnectez-vous pour continuer cette action.'
      );
    }

    if (error.status === 403) {
      return feedback(
        'warning',
        'Accès refusé',
        'Vous n’avez pas les droits nécessaires pour cette action.'
      );
    }

    if (error.status === 402) {
      return feedback(
        'warning',
        'Abonnement requis',
        'Un abonnement actif est requis pour continuer.'
      );
    }

    const apiMessage = usefulErrorMessage(error);

    if (apiMessage && (error.status === 400 || error.status === 409 || error.status === 422)) {
      return feedback('warning', fallback.title, apiMessage);
    }
  }

  const message = usefulErrorMessage(error);

  if (message) {
    return feedback(fallback.tone, fallback.title, message);
  }

  return fallback;
}

export function getFriendlyErrorMessage(
  error: unknown,
  fallback = 'Une erreur est survenue.'
) {
  return resolveActionFeedback(
    error,
    feedback('error', 'Action impossible', fallback)
  ).description;
}
