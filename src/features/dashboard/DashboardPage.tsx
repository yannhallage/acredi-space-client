import {
  DashboardSkeleton,
  PanelState,
  WidgetCard,
  WIDGET_COMPONENTS,
} from "./components";
import { useDashboardPage } from "./hooks/useDashboardPage";

export function DashboardPage() {
  const page = useDashboardPage();

  if (page.permissionsLoading || page.widgetsQuery.isLoading) {
    return <DashboardSkeleton />;
  }

  if (!page.canViewDashboard) {
    return (
      <PanelState
        title="Dashboard indisponible"
        body="Votre role ne permet pas d'afficher le tableau de bord."
      />
    );
  }

  if (page.widgetsQuery.error && !page.widgetsResponse) {
    return (
      <PanelState
        title="Dashboard indisponible"
        body="Impossible de charger les cartes du tableau de bord."
      />
    );
  }

  return (
    <div className="min-w-0 space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
            Dashboard {page.role ? page.role.toLowerCase() : ""}
          </p>
          <h1 className="mt-1 text-[18px] font-semibold tracking-normal text-[var(--text)]">
            Bonjour {page.user?.name?.split(" ")[0] ?? "Utilisateur"}.
          </h1>
          <p className="mt-1.5 text-[12px] text-[var(--muted)]">
            {page.permittedWidgets.length} carte{page.permittedWidgets.length > 1 ? "s" : ""} disponible
            {page.permittedWidgets.length > 1 ? "s" : ""} selon vos permissions.
          </p>
        </div>
      </header>

      {page.permittedWidgets.length ? (
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-4 lg:grid-cols-2">
          {page.permittedWidgets.map((widget) => {
            const WidgetComponent = WIDGET_COMPONENTS[widget.type];

            return (
              <WidgetCard key={widget.type} widget={widget}>
                <WidgetComponent context={page.context} />
              </WidgetCard>
            );
          })}
        </section>
      ) : (
        <PanelState
          title="Aucune carte disponible"
          body="Aucune carte ne correspond a vos permissions actuelles."
        />
      )}
    </div>
  );
}
