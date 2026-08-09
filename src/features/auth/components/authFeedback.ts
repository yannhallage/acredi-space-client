import { HttpError } from '../../../shared/api/http';

export type AuthFeedbackTone = 'error' | 'warning' | 'success';

export type AuthFeedback = {
  tone: AuthFeedbackTone;
  title: string;
  description: string;
};

export function authFeedback(
  tone: AuthFeedbackTone,
  title: string,
  description: string
): AuthFeedback {
  return { tone, title, description };
}

function resolveNetworkFeedback(error: unknown, fallback: AuthFeedback): AuthFeedback {
  if (error instanceof TypeError) {
    return authFeedback(
      'error',
      'Connexion réseau interrompue',
      'Vérifiez votre connexion internet, puis réessayez.'
    );
  }

  if (error instanceof HttpError) {
    if (error.status === 429) {
      return authFeedback(
        'warning',
        'Trop de tentatives',
        'Par sécurité, patientez quelques instants avant une nouvelle tentative.'
      );
    }

    if (error.status >= 500) {
      return authFeedback(
        'error',
        'Service indisponible',
        'Nous n’avons pas pu joindre le serveur. Réessayez dans un moment.'
      );
    }
  }

  return fallback;
}

export function resolveLoginFeedback(error: unknown): AuthFeedback {
  if (error instanceof HttpError) {
    if (error.status === 401 || error.status === 400) {
      return authFeedback(
        'error',
        'Identifiants incorrects',
        'L’e-mail ou le mot de passe ne correspond pas. Vérifiez vos informations, puis réessayez.'
      );
    }

    if (error.status === 403) {
      return authFeedback(
        'warning',
        'Accès refusé',
        'Ce compte n’est pas autorisé à se connecter. Contactez votre administrateur si besoin.'
      );
    }
  }

  return resolveNetworkFeedback(
    error,
    authFeedback(
      'error',
      'Connexion impossible',
      'Une erreur inattendue est survenue. Si le problème persiste, contactez le support Acredi.'
    )
  );
}

export function resolveForgotPasswordFeedback(error: unknown): AuthFeedback {
  if (error instanceof HttpError && (error.status === 404 || error.status === 400)) {
    return authFeedback(
      'warning',
      'Demande non traitée',
      'Impossible de lancer la réinitialisation avec cet e-mail. Vérifiez l’adresse saisie, puis réessayez.'
    );
  }

  return resolveNetworkFeedback(
    error,
    authFeedback(
      'error',
      'Envoi impossible',
      'Une erreur inattendue est survenue. Si le problème persiste, contactez le support Acredi.'
    )
  );
}

export function resolveOtpFeedback(error: unknown): AuthFeedback {
  if (error instanceof Error && /session otp/i.test(error.message)) {
    return authFeedback(
      'warning',
      'Session expirée',
      'Votre session de vérification n’est plus valide. Reconnectez-vous pour recevoir un nouveau code.'
    );
  }

  if (error instanceof HttpError && (error.status === 401 || error.status === 400 || error.status === 422)) {
    return authFeedback(
      'error',
      'Code incorrect ou expiré',
      'Vérifiez les 6 chiffres reçus par e-mail, ou demandez un nouveau code.'
    );
  }

  return resolveNetworkFeedback(
    error,
    authFeedback(
      'error',
      'Vérification impossible',
      'Nous n’avons pas pu valider ce code. Réessayez, ou reconnectez-vous pour en recevoir un nouveau.'
    )
  );
}

export function resolveResetPasswordFeedback(error: unknown): AuthFeedback {
  if (error instanceof HttpError && (error.status === 400 || error.status === 401 || error.status === 404 || error.status === 410)) {
    return authFeedback(
      'warning',
      'Lien invalide ou expiré',
      'Ce lien de réinitialisation n’est plus utilisable. Demandez un nouveau lien pour continuer.'
    );
  }

  return resolveNetworkFeedback(
    error,
    authFeedback(
      'error',
      'Réinitialisation impossible',
      'Une erreur inattendue est survenue. Si le problème persiste, contactez le support Acredi.'
    )
  );
}

export function resolvePasswordChangeFeedback(error: unknown): AuthFeedback {
  if (error instanceof HttpError && (error.status === 400 || error.status === 401 || error.status === 403)) {
    return authFeedback(
      'error',
      'Mot de passe actuel incorrect',
      'Vérifiez votre mot de passe actuel, puis choisissez un nouveau mot de passe conforme.'
    );
  }

  return resolveNetworkFeedback(
    error,
    authFeedback(
      'error',
      'Mise à jour impossible',
      'Nous n’avons pas pu enregistrer le nouveau mot de passe. Réessayez dans un moment.'
    )
  );
}

export function resolveProfileCompletionFeedback(error: unknown): AuthFeedback {
  if (error instanceof HttpError && (error.status === 400 || error.status === 422)) {
    return authFeedback(
      'warning',
      'Informations incomplètes',
      'Certaines données sont invalides. Vérifiez le formulaire, puis réessayez.'
    );
  }

  return resolveNetworkFeedback(
    error,
    authFeedback(
      'error',
      'Enregistrement impossible',
      'Nous n’avons pas pu finaliser votre profil. Réessayez dans un moment.'
    )
  );
}
