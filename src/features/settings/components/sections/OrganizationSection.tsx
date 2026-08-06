import { useEffect, useState, type FormEvent } from 'react';
import {
  useCurrentOrganizationQuery,
  useUpdateOrganizationMutation,
} from '../../../../shared/api/organizations';

type OrganizationSectionProps = {
  canUpdate: boolean;
};

export function OrganizationSection({ canUpdate }: OrganizationSectionProps) {
  const organizationQuery = useCurrentOrganizationQuery(true);
  const updateMutation = useUpdateOrganizationMutation();
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    billingEmail: '',
    websiteUrl: '',
    addressLine1: '',
    city: '',
    postalCode: '',
    country: '',
    industry: '',
  });

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
  }, [organizationQuery.data]);

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
        billingEmail: form.billingEmail.trim() || null,
        websiteUrl: form.websiteUrl.trim() || null,
        addressLine1: form.addressLine1.trim() || null,
        city: form.city.trim() || null,
        postalCode: form.postalCode.trim() || null,
        country: form.country.trim() || null,
        industry: form.industry.trim() || null,
      });
      await organizationQuery.refetch();
      setMessage('Organisation mise a jour.');
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Impossible de mettre a jour l organisation.'
      );
    }
  }

  if (organizationQuery.loading) {
    return (
      <section className="modal-setting-section">
        <h4>Informations de l organisation</h4>
        <p>Chargement...</p>
      </section>
    );
  }

  if (organizationQuery.error || !organizationQuery.data) {
    return (
      <section className="modal-setting-section">
        <h4>Informations de l organisation</h4>
        <p>{organizationQuery.error?.message ?? 'Organisation introuvable.'}</p>
      </section>
    );
  }

  return (
    <section className="modal-setting-section">
      <div className="modal-setting-section-heading">
        <div>
          <h4>Informations de l organisation</h4>
          <p>Mets a jour le nom, les details et les options principales.</p>
        </div>
      </div>

      <form className="modal-setting-org-form" onSubmit={handleSubmit}>
        <label>
          <span>Nom</span>
          <input
            value={form.name}
            disabled={!canUpdate || updateMutation.isPending}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            required
          />
        </label>
        <label>
          <span>Slug</span>
          <input
            value={form.slug}
            disabled={!canUpdate || updateMutation.isPending}
            onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
            required
          />
        </label>
        <label>
          <span>Email de facturation</span>
          <input
            type="email"
            value={form.billingEmail}
            disabled={!canUpdate || updateMutation.isPending}
            onChange={(event) =>
              setForm((current) => ({ ...current, billingEmail: event.target.value }))
            }
          />
        </label>
        <label>
          <span>Site web</span>
          <input
            value={form.websiteUrl}
            disabled={!canUpdate || updateMutation.isPending}
            onChange={(event) =>
              setForm((current) => ({ ...current, websiteUrl: event.target.value }))
            }
          />
        </label>
        <label>
          <span>Adresse</span>
          <input
            value={form.addressLine1}
            disabled={!canUpdate || updateMutation.isPending}
            onChange={(event) =>
              setForm((current) => ({ ...current, addressLine1: event.target.value }))
            }
          />
        </label>
        <label>
          <span>Ville</span>
          <input
            value={form.city}
            disabled={!canUpdate || updateMutation.isPending}
            onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
          />
        </label>
        <label>
          <span>Code postal</span>
          <input
            value={form.postalCode}
            disabled={!canUpdate || updateMutation.isPending}
            onChange={(event) =>
              setForm((current) => ({ ...current, postalCode: event.target.value }))
            }
          />
        </label>
        <label>
          <span>Pays (ISO)</span>
          <input
            value={form.country}
            maxLength={2}
            disabled={!canUpdate || updateMutation.isPending}
            onChange={(event) =>
              setForm((current) => ({ ...current, country: event.target.value.toUpperCase() }))
            }
          />
        </label>
        <label>
          <span>Industrie</span>
          <input
            value={form.industry}
            disabled={!canUpdate || updateMutation.isPending}
            onChange={(event) =>
              setForm((current) => ({ ...current, industry: event.target.value }))
            }
          />
        </label>

        {message ? <p className="modal-setting-org-message">{message}</p> : null}

        {canUpdate ? (
          <button className="button primary" type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        ) : (
          <p>Lecture seule</p>
        )}
      </form>
    </section>
  );
}
