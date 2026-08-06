import {
  invoiceAmountLabel,
  normalizeInvoiceStatus,
  useBillingInvoicesQuery,
} from '../../../../shared/api/billing';
import { formatBillingDate, formatInvoiceStatus } from '../../utils';

export function InvoicesSection() {
  const invoicesQuery = useBillingInvoicesQuery(true);
  const invoices = invoicesQuery.data ?? [];

  if (invoicesQuery.loading) {
    return (
      <section
        className="modal-setting-section modal-setting-billing"
        aria-busy="true"
        aria-label="Chargement des factures"
      >
        <div className="modal-setting-section-heading">
          <div>
            <h4>Historique des factures</h4>
            <p>Factures recentes de ton espace de travail.</p>
          </div>
        </div>

        <div
          className="modal-setting-profile-table modal-setting-invoice-table"
          role="table"
          aria-label="Factures"
        >
          <div className="modal-setting-profile-table-head modal-setting-invoice-row" role="row">
            <span role="columnheader">Numero</span>
            <span role="columnheader">Date</span>
            <span role="columnheader">Devise</span>
            <span role="columnheader">Montant</span>
            <span role="columnheader">Statut</span>
          </div>

          {['invoice-skeleton-1', 'invoice-skeleton-2', 'invoice-skeleton-3'].map((item) => (
            <div
              className="modal-setting-profile-row modal-setting-invoice-row skeleton"
              key={item}
              role="row"
            >
              <span className="skeleton-line" />
              <span className="skeleton-line" />
              <span className="skeleton-line" />
              <span className="skeleton-line" />
              <span className="skeleton-line modal-setting-invoice-skeleton-badge" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="modal-setting-section modal-setting-billing">
      <div className="modal-setting-section-heading">
        <div>
          <h4>Historique des factures</h4>
          <p>Factures recentes de ton espace de travail.</p>
        </div>
      </div>

      {!invoices.length ? (
        <p>Aucune facture pour le moment.</p>
      ) : (
        <div
          className="modal-setting-profile-table modal-setting-invoice-table"
          role="table"
          aria-label="Factures"
        >
          <div className="modal-setting-profile-table-head modal-setting-invoice-row" role="row">
            <span role="columnheader">Numero</span>
            <span role="columnheader">Date</span>
            <span role="columnheader">Devise</span>
            <span role="columnheader">Montant</span>
            <span role="columnheader">Statut</span>
          </div>

          {invoices.map((invoice) => {
            const status = normalizeInvoiceStatus(invoice.status);
            return (
              <div
                className="modal-setting-profile-row modal-setting-invoice-row"
                key={invoice.id}
                role="row"
              >
                <strong role="cell">{invoice.invoiceNumber}</strong>
                <span role="cell">{formatBillingDate(invoice.issuedAt)}</span>
                <span role="cell">{invoice.currency}</span>
                <span role="cell">{invoiceAmountLabel(invoice)}</span>
                <span role="cell">
                  <span className={`modal-setting-invoice-badge status-${status}`}>
                    {formatInvoiceStatus(status)}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
