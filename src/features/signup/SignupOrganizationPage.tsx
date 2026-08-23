import { FormEvent, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  useSignupCompleteOrganizationMutation,
  type CompanySize,
} from '../../shared/api/auth';
import { useAuth } from '../../shared/context';
import { AcrediLockup, Icon } from '../../shared/ui';

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

  const [orgStep, setOrgStep] = useState<3 | 4>(3);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [industry, setIndustry] = useState('');
  const [headcount, setHeadcount] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [billingEmail, setBillingEmail] = useState(user?.email ?? '');
  const [timezone, setTimezone] = useState('Europe/Paris');
  const [locale, setLocale] = useState('fr-FR');
  const [currency, setCurrency] = useState('EUR');
  const [country, setCountry] = useState('FR');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [siret, setSiret] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [message, setMessage] = useState('');

  const companySize = useMemo(() => companySizeFromHeadcount(headcount), [headcount]);
  const currentStep = orgStep;
  const stepLabel = `Etape ${currentStep} / 4`;

  if (!isAuthenticated) {
    return <Navigate to="/signup" replace />;
  }

  if (user?.onboardingStatus && user.onboardingStatus !== 'ORGANIZATION_SETUP_REQUIRED') {
    if (user.onboardingStatus === 'COMPLETED') {
      return <Navigate to="/signup/success" replace />;
    }
    return <Navigate to="/app/dashboard" replace />;
  }

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  function handleStep3Continue(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    if (!name.trim() || !slug.trim()) {
      setMessage('Le nom et le slug de l’organisation sont requis.');
      return;
    }
    if (!companySize) {
      setMessage('Indiquez le nombre de personnes avec lesquelles vous travaillerez.');
      return;
    }
    setOrgStep(4);
  }

  async function handleComplete(event: FormEvent) {
    event.preventDefault();
    setMessage('');

    if (!companySize) {
      setMessage('Indiquez le nombre de personnes avec lesquelles vous travaillerez.');
      setOrgStep(3);
      return;
    }

    try {
      const response = await completeMutation.mutateAsync({
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
      navigate('/signup/success', { replace: true });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Impossible de creer l’organisation');
    }
  }

  return (
    <div className="signup-org-page">
      <div className="signup-org-panel">
        <section className="signup-org-form">
          <header className="signup-org-header">
            <AcrediLockup size={36} fontSize={24} />
            <div className="signup-org-steps">
              <p className="eyebrow">{stepLabel}</p>
              <div className="signup-org-stepper" aria-hidden="true">
                {[1, 2, 3, 4].map((step) => (
                  <span key={step} className={step <= currentStep ? 'done' : ''} />
                ))}
              </div>
            </div>
          </header>

          {orgStep === 3 ? (
            <form onSubmit={handleStep3Continue}>
              <h1>Parlez-nous de votre organisation</h1>
              <p className="muted">
                Ces informations personnalisent votre espace Acredi Space.
              </p>

              <label className="text-sm">
                <span>Nom de l’organisation</span>
                <span className="input-wrap">
                  <Icon name="building" size={16} />
                  <input
                    value={name}
                    onChange={(event) => handleNameChange(event.target.value)}
                    required
                  />
                </span>
              </label>

              <label className="text-sm">
                <span>Identifiant (slug)</span>
                <span className="input-wrap">
                  <Icon name="hash" size={16} />
                  <input
                    value={slug}
                    onChange={(event) => {
                      setSlugTouched(true);
                      setSlug(slugify(event.target.value));
                    }}
                    required
                  />
                </span>
              </label>

              <label className="text-sm">
                <span>Domaine d’activite</span>
                <span className="input-wrap">
                  <Icon name="grid" size={16} />
                  <input
                    value={industry}
                    onChange={(event) => setIndustry(event.target.value)}
                    placeholder="Ex. Tech, Conseil, Education..."
                  />
                </span>
              </label>

              <label className="text-sm">
                <span>Avec combien de personnes travaillerez-vous ?</span>
                <span className="input-wrap">
                  <Icon name="users" size={16} />
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={10000}
                    step={1}
                    placeholder="Ex. 8"
                    value={headcount}
                    onChange={(event) => setHeadcount(event.target.value)}
                    required
                  />
                  <span className="signup-org-headcount-suffix">personnes</span>
                </span>
              </label>

              {message && <p className="auth-error text-red-500 text-sm">{message}</p>}
              <button className="button primary button-wide" type="submit">
                Continuer
              </button>
            </form>
          ) : (
            <form onSubmit={handleComplete}>
              <h1>Completez le profil de l’organisation</h1>
              <p className="muted">Adresse, facturation et preferences — modifiables plus tard.</p>

              <label className="text-sm">
                <span>Site web</span>
                <span className="input-wrap">
                  <Icon name="share" size={16} />
                  <input
                    value={websiteUrl}
                    onChange={(event) => setWebsiteUrl(event.target.value)}
                    placeholder="https://"
                  />
                </span>
              </label>

              <label className="text-sm">
                <span>Email de facturation</span>
                <span className="input-wrap">
                  <Icon name="mail" size={16} />
                  <input
                    type="email"
                    value={billingEmail}
                    onChange={(event) => setBillingEmail(event.target.value)}
                  />
                </span>
              </label>

              <div className="signup-name-row">
                <label className="text-sm">
                  <span>Fuseau horaire</span>
                  <input
                    className="signup-plain-input"
                    value={timezone}
                    onChange={(event) => setTimezone(event.target.value)}
                  />
                </label>
                <label className="text-sm">
                  <span>Locale</span>
                  <input
                    className="signup-plain-input"
                    value={locale}
                    onChange={(event) => setLocale(event.target.value)}
                  />
                </label>
              </div>

              <div className="signup-name-row">
                <label className="text-sm">
                  <span>Devise</span>
                  <input
                    className="signup-plain-input"
                    value={currency}
                    onChange={(event) => setCurrency(event.target.value.toUpperCase())}
                    maxLength={12}
                  />
                </label>
                <label className="text-sm">
                  <span>Pays (ISO)</span>
                  <input
                    className="signup-plain-input"
                    value={country}
                    onChange={(event) => setCountry(event.target.value.toUpperCase())}
                    maxLength={2}
                  />
                </label>
              </div>

              <label className="text-sm">
                <span>Adresse</span>
                <input
                  className="signup-plain-input"
                  value={addressLine1}
                  onChange={(event) => setAddressLine1(event.target.value)}
                />
              </label>
              <label className="text-sm">
                <span>Complement</span>
                <input
                  className="signup-plain-input"
                  value={addressLine2}
                  onChange={(event) => setAddressLine2(event.target.value)}
                />
              </label>

              <div className="signup-name-row">
                <label className="text-sm">
                  <span>Ville</span>
                  <input
                    className="signup-plain-input"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                  />
                </label>
                <label className="text-sm">
                  <span>Code postal</span>
                  <input
                    className="signup-plain-input"
                    value={postalCode}
                    onChange={(event) => setPostalCode(event.target.value)}
                  />
                </label>
              </div>

              <div className="signup-name-row">
                <label className="text-sm">
                  <span>SIRET</span>
                  <input
                    className="signup-plain-input"
                    value={siret}
                    onChange={(event) => setSiret(event.target.value)}
                  />
                </label>
                <label className="text-sm">
                  <span>N° TVA</span>
                  <input
                    className="signup-plain-input"
                    value={vatNumber}
                    onChange={(event) => setVatNumber(event.target.value)}
                  />
                </label>
              </div>

              {message && <p className="auth-error text-red-500 text-sm">{message}</p>}

              <div className="signup-org-actions">
                <button
                  type="button"
                  className="button ghost"
                  onClick={() => {
                    setMessage('');
                    setOrgStep(3);
                  }}
                >
                  Retour
                </button>
                <button
                  className="button primary"
                  type="submit"
                  disabled={completeMutation.isPending}
                >
                  {completeMutation.isPending ? 'Creation...' : 'Terminer'}
                </button>
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
          <p className="signup-org-aside-footnote">
            Rejoignez les equipes qui centralisent fichiers, discussions et reunions sur Acredi Space.
          </p>
        </aside>
      </div>
    </div>
  );
}
