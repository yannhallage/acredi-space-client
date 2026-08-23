import { FormEvent, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  useSignupCompleteOrganizationMutation,
  type CompanySize,
} from '../../shared/api/auth';
import { clearSignupPlanId, getSignupPlanId, signupPlansPath } from '../../shared/auth/signupPlan';
import { useAuth } from '../../shared/context';
import { AcrediLockup, Icon } from '../../shared/ui';
import {
  AuthFeedbackBanner,
  AuthSubmitButton,
  authFeedback,
  resolveSignupOrganizationFeedback,
  type AuthFeedback,
} from '../auth/components';

function companySizeFromHeadcount(value: string): CompanySize | null {
  const count = Number.parseInt(value, 10);
  if (!Number.isInteger(count) || count < 1) {
    return null;
  }
  if (count <= 1) return 'MICRO';
  if (count <= 7) return 'SMALL';
  if (count <= 15) return 'MEDIUM';
  if (count <= 24) return 'LARGE';
  return 'ENTERPRISE';
}

const BENEFITS = [
  'Espace organisation partage',
  'Collaboration fichiers, notes et reunions',
  'Acces et roles centralises',
  'Equipes et invitations',
  'Pilotage de l’activite',
];

const INTEGRATIONS = [
  { src: '/signuporganization/word.png', alt: 'Word', tone: 'light' },
  { src: '/signuporganization/excel-fluent.png', alt: 'Excel', tone: 'light', fill: true },
  { src: '/gmail-logo.svg', alt: 'Gmail', tone: 'light' },
  { src: '/signuporganization/mail-circle.png', alt: 'Mail', tone: 'light', shape: 'circle' },
  { src: '/signuporganization/play-circle.png', alt: 'Visio', tone: 'light', shape: 'circle' },
];

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 190);
}

export function SignupOrganizationPage() {
  const { user, completeAuthSession, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const completeMutation = useSignupCompleteOrganizationMutation();

  const [orgStep, setOrgStep] = useState<4 | 5>(4);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [industry, setIndustry] = useState('');
  const [headcount, setHeadcount] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [billingEmail, setBillingEmail] = useState(user?.email ?? '');
  const [timezone, setTimezone] = useState('Africa/Abidjan');
  const [locale, setLocale] = useState('fr-FR');
  const [currency, setCurrency] = useState('XOF');
  const [country, setCountry] = useState('CI');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [siret, setSiret] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [feedback, setFeedback] = useState<AuthFeedback | null>(null);

  const companySize = useMemo(() => companySizeFromHeadcount(headcount), [headcount]);
  const currentStep = orgStep;
  const stepLabel = `Etape ${currentStep} / 5`;
  const planId = getSignupPlanId();

  if (!isAuthenticated) {
    return <Navigate to="/signup" replace />;
  }

  if (user?.onboardingStatus && user.onboardingStatus !== 'ORGANIZATION_SETUP_REQUIRED') {
    if (user.onboardingStatus === 'COMPLETED') {
      return <Navigate to="/signup/success" replace />;
    }
    return <Navigate to="/app/dashboard" replace />;
  }

  if (!planId) {
    return <Navigate to={signupPlansPath} replace />;
  }

  function clearFeedback() {
    if (feedback) setFeedback(null);
  }

  function handleNameChange(value: string) {
    setName(value);
    clearFeedback();
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  function handleStep4Continue(event: FormEvent) {
    event.preventDefault();
    setFeedback(null);
    if (!name.trim() || !slug.trim()) {
      setFeedback(
        authFeedback(
          'warning',
          'Informations incomplètes',
          'Le nom et l’identifiant de l’organisation sont requis pour continuer.'
        )
      );
      return;
    }
    if (!companySize) {
      setFeedback(
        authFeedback(
          'warning',
          'Effectif manquant',
          'Indiquez le nombre de personnes avec lesquelles vous travaillerez.'
        )
      );
      return;
    }
    setOrgStep(5);
  }

  async function handleComplete(event: FormEvent) {
    event.preventDefault();
    setFeedback(null);

    if (!companySize) {
      setFeedback(
        authFeedback(
          'warning',
          'Effectif manquant',
          'Indiquez le nombre de personnes avec lesquelles vous travaillerez.'
        )
      );
      setOrgStep(4);
      return;
    }

    const selectedPlanId = getSignupPlanId();
    if (!selectedPlanId) {
      navigate(signupPlansPath, { replace: true });
      return;
    }

    try {
      const response = await completeMutation.mutateAsync({
        planId: selectedPlanId,
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        industry: industry.trim() || undefined,
        companySize,
        websiteUrl: websiteUrl.trim() || undefined,
        billingEmail: billingEmail.trim() || user?.email,
        timezone,
        locale,
        currency,
        country: country.trim() || undefined,
        addressLine1: addressLine1.trim() || undefined,
        addressLine2: addressLine2.trim() || undefined,
        city: city.trim() || undefined,
        postalCode: postalCode.trim() || undefined,
        siret: siret.trim() || undefined,
        vatNumber: vatNumber.trim() || undefined,
      });
      completeAuthSession(response.data, { persistTrustedDevice: false });
      clearSignupPlanId();
      navigate('/signup/success', { replace: true });
    } catch (error) {
      console.error(error);
      setFeedback(resolveSignupOrganizationFeedback(error));
    }
  }

  function handleBack() {
    setFeedback(null);
    if (orgStep === 5) {
      setOrgStep(4);
      return;
    }
    navigate(signupPlansPath);
  }

  return (
    <div className="signup-org-page">
      <div className="signup-org-stack">
        <button
          type="button"
          className="signup-org-back"
          aria-label="Retour"
          onClick={handleBack}
        >
          <Icon name="arrowLeft" size={22} />
        </button>

        <div className="signup-org-panel">
        <section className="signup-org-form">
          <header className="signup-org-header">
            <AcrediLockup size={36} fontSize={24} />
            <div className="signup-org-steps">
              <p className="eyebrow">{stepLabel}</p>
              <div className="signup-org-stepper" aria-hidden="true">
                {[1, 2, 3, 4, 5].map((step) => (
                  <span key={step} className={step <= currentStep ? 'done' : ''} />
                ))}
              </div>
            </div>
          </header>

          {orgStep === 4 ? (
            <form className="login-form" onSubmit={handleStep4Continue}>
              <h1>Parlez-nous de votre organisation</h1>
              <p className="muted">
                Ces informations personnalisent votre espace Acredi Space.
              </p>

              <label>
                <span>
                  Nom de l’organisation <em aria-hidden="true">*</em>
                </span>
                <span className="input-wrap">
                  <input
                    value={name}
                    onChange={(event) => handleNameChange(event.target.value)}
                    placeholder="Ex. Acredi Studio"
                    required
                  />
                </span>
              </label>

              <label>
                <span>
                  Identifiant (slug) <em aria-hidden="true">*</em>
                </span>
                <span className="input-wrap">
                  <input
                    value={slug}
                    onChange={(event) => {
                      setSlugTouched(true);
                      setSlug(slugify(event.target.value));
                      clearFeedback();
                    }}
                    placeholder="acredi-studio"
                    required
                  />
                </span>
              </label>

              <label>
                <span>Domaine d’activite</span>
                <span className="input-wrap">
                  <input
                    value={industry}
                    onChange={(event) => {
                      setIndustry(event.target.value);
                      clearFeedback();
                    }}
                    placeholder="Ex. Tech, Conseil, Education..."
                  />
                </span>
              </label>

              <label>
                <span>
                  Avec combien de personnes travaillerez-vous ? <em aria-hidden="true">*</em>
                </span>
                <span className="input-wrap">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={10000}
                    step={1}
                    placeholder="Ex. 8"
                    value={headcount}
                    onChange={(event) => {
                      setHeadcount(event.target.value);
                      clearFeedback();
                    }}
                    required
                  />
                  <span className="signup-org-headcount-suffix">personnes</span>
                </span>
              </label>

              {feedback && <AuthFeedbackBanner feedback={feedback} />}
              <div className="signup-org-actions">
                <AuthSubmitButton>Continuer</AuthSubmitButton>
              </div>
            </form>
          ) : (
            <form className="login-form" onSubmit={handleComplete}>
              <h1>Completez le profil de l’organisation</h1>
              <p className="muted">Adresse, facturation et preferences — modifiables plus tard.</p>

              <label>
                <span>Site web</span>
                <span className="input-wrap">
                  <input
                    value={websiteUrl}
                    onChange={(event) => {
                      setWebsiteUrl(event.target.value);
                      clearFeedback();
                    }}
                    placeholder="https://"
                  />
                </span>
              </label>

              <label>
                <span>E-mail de facturation</span>
                <span className="input-wrap">
                  <input
                    type="email"
                    value={billingEmail}
                    onChange={(event) => {
                      setBillingEmail(event.target.value);
                      clearFeedback();
                    }}
                    placeholder="Saisissez l’e-mail de facturation"
                  />
                </span>
              </label>

              <div className="signup-name-row">
                <label>
                  <span>Fuseau horaire</span>
                  <span className="input-wrap">
                    <input
                      value={timezone}
                      onChange={(event) => {
                        setTimezone(event.target.value);
                        clearFeedback();
                      }}
                    />
                  </span>
                </label>
                <label>
                  <span>Locale</span>
                  <span className="input-wrap">
                    <input
                      value={locale}
                      onChange={(event) => {
                        setLocale(event.target.value);
                        clearFeedback();
                      }}
                    />
                  </span>
                </label>
              </div>

              <div className="signup-name-row">
                <label>
                  <span>Devise</span>
                  <span className="input-wrap">
                    <input
                      value={currency}
                      onChange={(event) => {
                        setCurrency(event.target.value.toUpperCase());
                        clearFeedback();
                      }}
                      maxLength={12}
                    />
                  </span>
                </label>
                <label>
                  <span>Pays (ISO)</span>
                  <span className="input-wrap">
                    <input
                      value={country}
                      onChange={(event) => {
                        setCountry(event.target.value.toUpperCase());
                        clearFeedback();
                      }}
                      maxLength={2}
                      placeholder="CI"
                    />
                  </span>
                </label>
              </div>

              <label>
                <span>Adresse</span>
                <span className="input-wrap">
                  <input
                    value={addressLine1}
                    onChange={(event) => {
                      setAddressLine1(event.target.value);
                      clearFeedback();
                    }}
                  />
                </span>
              </label>
              <label>
                <span>Complement</span>
                <span className="input-wrap">
                  <input
                    value={addressLine2}
                    onChange={(event) => {
                      setAddressLine2(event.target.value);
                      clearFeedback();
                    }}
                  />
                </span>
              </label>

              <div className="signup-name-row">
                <label>
                  <span>Ville</span>
                  <span className="input-wrap">
                    <input
                      value={city}
                      onChange={(event) => {
                        setCity(event.target.value);
                        clearFeedback();
                      }}
                    />
                  </span>
                </label>
                <label>
                  <span>Code postal</span>
                  <span className="input-wrap">
                    <input
                      value={postalCode}
                      onChange={(event) => {
                        setPostalCode(event.target.value);
                        clearFeedback();
                      }}
                    />
                  </span>
                </label>
              </div>

              <div className="signup-name-row">
                <label>
                  <span>SIRET</span>
                  <span className="input-wrap">
                    <input
                      value={siret}
                      onChange={(event) => {
                        setSiret(event.target.value);
                        clearFeedback();
                      }}
                    />
                  </span>
                </label>
                <label>
                  <span>N° TVA</span>
                  <span className="input-wrap">
                    <input
                      value={vatNumber}
                      onChange={(event) => {
                        setVatNumber(event.target.value);
                        clearFeedback();
                      }}
                    />
                  </span>
                </label>
              </div>

              {feedback && <AuthFeedbackBanner feedback={feedback} />}

              <div className="signup-org-actions">
                <AuthSubmitButton loading={completeMutation.isPending}>
                  Terminer
                </AuthSubmitButton>
              </div>
            </form>
          )}
        </section>

        <aside className="signup-org-aside">
          <div className="signup-org-aside-art">
            <img
              src="/signuporganization/signuporganization.png"
              alt="Équipe collaborant autour d’une table"
              className="signup-org-aside-image"
              draggable={false}
            />
          </div>
          <h2>La collaboration d’equipe, simplifiee</h2>
          <ul className="signup-org-benefits">
            {BENEFITS.map((item) => (
              <li key={item}>
                <Icon name="check" size={16} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="signup-org-integrations" aria-label="Integrations Word, Excel, Gmail et messagerie">
            <div className="signup-org-integrations-stack" aria-hidden="true">
              {INTEGRATIONS.map((item) => (
                <span
                  key={item.alt}
                  className={`signup-org-integrations-tile ${item.tone}${
                    item.shape === 'circle' ? ' circle' : ''
                  }${item.fill ? ' fill' : ''}`}
                  title={item.alt}
                >
                  <img src={item.src} alt="" />
                </span>
              ))}
            </div>
            <p className="signup-org-integrations-caption">
              Word, Excel, Gmail, mails et visio — deja au meme endroit.
            </p>
          </div>
          <p className="signup-org-aside-footnote">
            Rejoignez les equipes qui centralisent fichiers, discussions et reunions sur Acredi Space.
          </p>
        </aside>
        </div>
      </div>
    </div>
  );
}
