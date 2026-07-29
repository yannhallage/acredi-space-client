import { BILLING_INVOICES } from '../../billing/data';
import { formatBillingDate, formatInvoiceStatus } from '../../utils';

export function InvoicesSection() {
  return (
    <section className="modal-setting-section modal-setting-billing">
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
          <span role="columnheader">Plan</span>
          <span role="columnheader">Montant</span>
          <span role="columnheader">Statut</span>
        </div>

        {BILLING_INVOICES.map((invoice) => (
          <div
            className="modal-setting-profile-row modal-setting-invoice-row"
            key={invoice.id}
            role="row"
          >
            <strong role="cell">{invoice.number}</strong>
            <span role="cell">{formatBillingDate(invoice.issuedAt)}</span>
            <span role="cell">{invoice.planName}</span>
            <span role="cell">{invoice.amountLabel}</span>
            <span role="cell">
              <span className={`modal-setting-invoice-badge status-${invoice.status}`}>
                {formatInvoiceStatus(invoice.status)}
              </span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
