import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  useCurrentOrganizationQuery,
  useUpdateOrganizationMutation,
  useUploadOrganizationLogoMutation,
} from '../../../../shared/api/organizations';
import { getFriendlyErrorMessage } from '../../../../shared/feedback';
import { Icon } from '../../../../shared/ui';
import { MAX_AVATAR_SIZE } from '../../utils';

type OrganizationSectionProps = {
  canUpdate: boolean;
};

type OrgFormState = {
  name: string;
  slug: string;
  billingEmail: string;
  websiteUrl: string;
  addressLine1: string;
  city: string;
  postalCode: string;
  country: string;
  industry: string;
};

const EMPTY_FORM: OrgFormState = {
  name: '',
  slug: '',
  billingEmail: '',
  websiteUrl: '',
  addressLine1: '',
  city: '',
  postalCode: '',
  country: '',
  industry: '',
};

export function OrganizationSection({ canUpdate }: OrganizationSectionProps) {
  const organizationQuery = useCurrentOrganizationQuery(true);
  const updateMutation = useUpdateOrganizationMutation();
  const uploadLogoMutation = useUploadOrganizationLogoMutation();
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<'success' | 'error'>('success');
  const [logoMessage, setLogoMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(
    null
  );
  const [form, setForm] = useState<OrgFormState>(EMPTY_FORM);
  const [logoUrl, setLogoUrl] = useState('');
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  // const logoUrlFieldId = useId();
  // const logoUrlInputRef = useRef<HTMLInputElement>(null);
  const isUploadingLogo = uploadLogoMutation.isPending;
  const disabled = !canUpdate || updateMutation.isPending || isUploadingLogo;
  const logoPreview = logoPreviewUrl ?? logoUrl.trim();

  useEffect(() => {
    const organization = organizationQuery.data;
    if (!organization) {
      return;
    }
    setForm({
      name: organization.name ?? '',
      slug: organization.slug ?? '',
      billingEmail: organization.billingEmail ?? '',
      websiteUrl: organization.websiteUrl ?? '',
      addressLine1: organization.addressLine1 ?? '',
      city: organization.city ?? '',
      postalCode: organization.postalCode ?? '',
      country: organization.country ?? '',
      industry: organization.industry ?? '',
    });
    setLogoUrl(organization.logoUrl ?? '');
  }, [organizationQuery.data]);

  useEffect(() => {
    if (!logoPreviewUrl?.startsWith('blob:')) {
      return undefined;
    }

    return () => {
      URL.revokeObjectURL(logoPreviewUrl);
    };
  }, [logoPreviewUrl]);

  function updateField<K extends keyof OrgFormState>(key: K, value: OrgFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !organizationQuery.data) {
      return;
    }

    setLogoMessage(null);

    if (!file.type.startsWith('image/')) {
      setLogoMessage({ type: 'error', text: 'Merci de choisir une image valide.' });
      event.target.value = '';
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setLogoMessage({ type: 'error', text: 'Le logo doit faire moins de 5 Mo.' });
      event.target.value = '';
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setLogoPreviewUrl(previewUrl);

    try {
      const updated = await uploadLogoMutation.mutateAsync(organizationQuery.data.id, file);
      setLogoUrl(updated.logoUrl ?? '');
      setLogoPreviewUrl(null);
      setLogoMessage({ type: 'success', text: 'Logo mis à jour.' });
      await organizationQuery.refetch();
    } catch (error) {
      setLogoPreviewUrl(null);
      setLogoMessage({
        type: 'error',
        text: getFriendlyErrorMessage(error, 'Impossible de mettre à jour le logo.'),
      });
    } finally {
      event.target.value = '';
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canUpdate || !organizationQuery.data) {
      return;
    }
    setMessage(null);
    try {
      await updateMutation.mutateAsync(organizationQuery.data.id, {
        name: form.name.trim(),
        slug: form.slug.trim(),
        // logoUrl: form.logoUrl.trim() || null,
        billingEmail: form.billingEmail.trim() || null,
        websiteUrl: form.websiteUrl.trim() || null,
        addressLine1: form.addressLine1.trim() || null,
        city: form.city.trim() || null,
        postalCode: form.postalCode.trim() || null,
        country: form.country.trim() || null,
        industry: form.industry.trim() || null,
      });
      await organizationQuery.refetch();
      setMessageTone('success');
      setMessage('Organisation mise à jour.');
    } catch (error) {
      setMessageTone('error');
      setMessage(
        getFriendlyErrorMessage(error, "Impossible de mettre à jour l'organisation.")
      );
    }
  }

  if (organizationQuery.loading) {
    return (
      <section
        className="modal-setting-section modal-setting-org"
        aria-busy="true"
        aria-label="Chargement des informations de l'organisation"
      >
        <div className="modal-setting-section-heading">
          <div>
            <h4>Informations de l&apos;organisation</h4>
            <p>Mets à jour le nom, les détails et les options principales.</p>
          </div>
        </div>

        <div className="modal-setting-org-form modal-setting-org-skeleton">
          <div className="modal-setting-org-logo">
            <span className="skeleton-line modal-setting-org-skeleton-label" />
            <div className="modal-setting-org-logo-row">
              <span className="skeleton-avatar modal-setting-org-skeleton-logo" />
              <div className="modal-setting-org-logo-meta skeleton-copy">
                <span className="skeleton-line skeleton-short" />
                <span className="skeleton-line" />
              </div>
            </div>
          </div>

          <div className="modal-setting-org-grid">
            {Array.from({ length: 9 }, (_, index) => (
              <div
                className={`modal-setting-org-field${index === 6 ? ' modal-setting-org-field-full' : ''}`}
                key={`org-skeleton-field-${index}`}
              >
                <span className="skeleton-line modal-setting-org-skeleton-label" />
                <span className="skeleton-line modal-setting-org-skeleton-input" />
              </div>
            ))}
          </div>

          <div className="modal-setting-org-actions">
            <span className="skeleton-line modal-setting-org-skeleton-button" />
          </div>
        </div>
      </section>
    );
  }

  if (organizationQuery.error || !organizationQuery.data) {
    return (
      <section className="modal-setting-section">
        <h4>Informations de l&apos;organisation</h4>
        <p className="modal-setting-org-state error">
          {organizationQuery.error?.message ?? 'Organisation introuvable.'}
        </p>
      </section>
    );
  }

  return (
    <section className="modal-setting-section modal-setting-org">
      <div className="modal-setting-section-heading">
        <div>
          <h4>Informations de l&apos;organisation</h4>
          <p>Mets à jour le nom, les détails et les options principales.</p>
        </div>
      </div>

      <form className="modal-setting-org-form" onSubmit={handleSubmit}>
        <div className="modal-setting-org-logo">
          <span className="modal-setting-org-label">Logo de l&apos;organisation</span>
          <div className="modal-setting-org-logo-row">
            <button
              type="button"
              className={`modal-setting-org-logo-preview${logoPreview ? ' has-image' : ''}`}
              disabled={disabled}
              aria-label="Importer le logo"
              onClick={() => logoFileInputRef.current?.click()}
            >
              {logoPreview ? (
                <img src={logoPreview} alt="" />
              ) : (
                <Icon name="building" size={28} />
              )}
            </button>
            <div className="modal-setting-org-logo-meta">
              {canUpdate ? (
                <button
                  type="button"
                  className="modal-setting-org-logo-action"
                  disabled={disabled}
                  onClick={() => logoFileInputRef.current?.click()}
                >
                  {isUploadingLogo ? 'Import...' : 'Importer le logo'}
                </button>
              ) : null}
              <p>
                L&apos;ajout d&apos;un logo aidera vos collaborateurs à reconnaître
                l&apos;espace de travail.
              </p>
              {logoMessage ? (
                <small className={`modal-setting-org-logo-message ${logoMessage.type}`}>
                  {logoMessage.text}
                </small>
              ) : null}
              {canUpdate ? (
                <input
                  ref={logoFileInputRef}
                  className="modal-setting-org-logo-file"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  disabled={disabled}
                />
              ) : null}
              {/* URL du logo (désactivé au profit de l'upload fichier)
              {canUpdate ? (
                <label className="modal-setting-org-logo-url" htmlFor={logoUrlFieldId}>
                  <span>URL du logo</span>
                  <input
                    id={logoUrlFieldId}
                    ref={logoUrlInputRef}
                    type="url"
                    value={logoUrl}
                    disabled={disabled}
                    placeholder="https://exemple.com/logo.png"
                    onChange={(event) => setLogoUrl(event.target.value)}
                  />
                </label>
              ) : null}
              */}
            </div>
          </div>
        </div>

        <div className="modal-setting-org-grid">
          <label className="modal-setting-org-field">
            <span>
              Nom <em aria-hidden="true">*</em>
            </span>
            <input
              value={form.name}
              disabled={disabled}
              onChange={(event) => updateField('name', event.target.value)}
              required
            />
          </label>

          <label className="modal-setting-org-field">
            <span>
              Slug <em aria-hidden="true">*</em>
            </span>
            <input
              value={form.slug}
              disabled={disabled}
              onChange={(event) => updateField('slug', event.target.value)}
              required
            />
          </label>

          <label className="modal-setting-org-field">
            <span>Industrie</span>
            <input
              value={form.industry}
              disabled={disabled}
              placeholder="Ex. : technologie, santé..."
              onChange={(event) => updateField('industry', event.target.value)}
            />
          </label>

          <label className="modal-setting-org-field">
            <span>Site web</span>
            <input
              type="url"
              value={form.websiteUrl}
              disabled={disabled}
              placeholder="https://"
              onChange={(event) => updateField('websiteUrl', event.target.value)}
            />
          </label>

          <label className="modal-setting-org-field">
            <span>Email de facturation</span>
            <input
              type="email"
              value={form.billingEmail}
              disabled={disabled}
              placeholder="facturation@entreprise.com"
              onChange={(event) => updateField('billingEmail', event.target.value)}
            />
          </label>

          <label className="modal-setting-org-field">
            <span>Pays (ISO)</span>
            <input
              value={form.country}
              maxLength={2}
              disabled={disabled}
              placeholder="FR"
              onChange={(event) => updateField('country', event.target.value.toUpperCase())}
            />
          </label>

          <label className="modal-setting-org-field modal-setting-org-field-full">
            <span>Adresse</span>
            <input
              value={form.addressLine1}
              disabled={disabled}
              placeholder="Numéro et rue"
              onChange={(event) => updateField('addressLine1', event.target.value)}
            />
          </label>

          <label className="modal-setting-org-field">
            <span>Ville</span>
            <input
              value={form.city}
              disabled={disabled}
              onChange={(event) => updateField('city', event.target.value)}
            />
          </label>

          <label className="modal-setting-org-field">
            <span>Code postal</span>
            <input
              value={form.postalCode}
              disabled={disabled}
              onChange={(event) => updateField('postalCode', event.target.value)}
            />
          </label>
        </div>

        {message ? (
          <p className={`modal-setting-org-message ${messageTone}`}>{message}</p>
        ) : null}

        <div className="modal-setting-org-actions">
          {canUpdate ? (
            <button className="button primary" type="submit" disabled={disabled}>
              {updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          ) : (
            <p className="modal-setting-org-readonly">Lecture seule</p>
          )}
        </div>
      </form>
    </section>
  );
}
