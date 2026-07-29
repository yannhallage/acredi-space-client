import { EmptyBlock } from "./EmptyBlock";

export function AuditLogWidget() {
  return (
    <EmptyBlock
      illustration="file"
      title="Aucun evenement d'audit recent"
      body="Les actions sensibles seront affichees ici quand l'API audit sera disponible."
    />
  );
}
