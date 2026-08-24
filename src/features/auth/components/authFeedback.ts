import { HttpError } from '../../../shared/api/http';
import {
  feedback,
  resolveNetworkFeedback,
  type Feedback,
  type FeedbackTone,
} from '../../../shared/feedback';

export type AuthFeedbackTone = FeedbackTone;
export type AuthFeedback = Feedback;
export const authFeedback = feedback;

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

function errorLooksLike(error: unknown, ...needles: string[]) {
  const parts = [
    error instanceof Error ? error.message : '',
    error instanceof HttpError && typeof error.payload?.message === 'string' ? error.payload.message : '',
    error instanceof HttpError && typeof error.payload?.error === 'string' ? error.payload.error : '',
  ]
    .join(' ')
    .toLowerCase();

  return needles.some((needle) => parts.includes(needle.toLowerCase()));
}

export function resolveSignupStartFeedback(error: unknown): AuthFeedback {
  if (errorLooksLike(error, 'email already used')) {
    return authFeedback(
      'warning',
      'E-mail déjà utilisé',
      'Un compte existe déjà avec cette adresse. Connectez-vous, ou utilisez un autre e-mail.'
    );
  }

  if (errorLooksLike(error, 'unable to send signup otp')) {
    return authFeedback(
      'error',
      'Envoi du code impossible',
      'Nous n’avons pas pu envoyer le code de vérification. Vérifiez l’e-mail, puis réessayez.'
    );
  }

  if (error instanceof HttpError && (error.status === 400 || error.status === 422)) {
    return authFeedback(
      'warning',
      'Informations invalides',
      'Vérifiez votre nom, votre e-mail et un mot de passe d’au moins 8 caractères, puis réessayez.'
    );
  }

  return resolveNetworkFeedback(
    error,
    authFeedback(
      'error',
      'Inscription impossible',
      'Une erreur inattendue est survenue. Si le problème persiste, contactez le support Acredi.'
    )
  );
}

export function resolveSignupOrganizationFeedback(error: unknown): AuthFeedback {
  if (errorLooksLike(error, 'organization name already exists')) {
    return authFeedback(
      'warning',
      'Nom déjà pris',
      'Cette organisation existe déjà. Choisissez un autre nom pour continuer.'
    );
  }

  if (errorLooksLike(error, 'organization slug already exists')) {
    return authFeedback(
      'warning',
      'Identifiant déjà pris',
      'Cet identifiant d’organisation est déjà utilisé. Modifiez le slug, puis réessayez.'
    );
  }

  if (errorLooksLike(error, 'selected plan is not available', 'plan not found')) {
    return authFeedback(
      'warning',
      'Offre indisponible',
      'Le plan sélectionné n’est plus proposé. Retournez aux abonnements pour en choisir un autre.'
    );
  }

  if (errorLooksLike(error, 'iso 3166')) {
    return authFeedback(
      'warning',
      'Code pays invalide',
      'Indiquez un code pays ISO à 2 lettres, par exemple CI ou FR.'
    );
  }

  if (errorLooksLike(error, 'already belongs to an organization')) {
    return authFeedback(
      'warning',
      'Organisation déjà créée',
      'Ce compte est déjà rattaché à une organisation. Reconnectez-vous pour continuer.'
    );
  }

  if (error instanceof HttpError && (error.status === 400 || error.status === 422)) {
    return authFeedback(
      'warning',
      'Informations incomplètes',
      'Certaines données de l’organisation sont invalides. Vérifiez le formulaire, puis réessayez.'
    );
  }

  return resolveNetworkFeedback(
    error,
    authFeedback(
      'error',
      'Création impossible',
      'Nous n’avons pas pu créer l’organisation. Réessayez dans un moment.'
    )
  );
}

export function resolveSignupPlansFeedback(error: unknown): AuthFeedback {
  return resolveNetworkFeedback(
    error,
    authFeedback(
      'error',
      'Offres indisponibles',
      'Nous n’avons pas pu charger les abonnements. Vérifiez votre connexion, puis réessayez.'
    )
  );
}
