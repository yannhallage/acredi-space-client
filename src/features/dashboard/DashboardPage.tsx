import {
  DashboardSkeleton,
  PanelState,
  WelcomeWidget,
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
        illustration="user"
        title="Dashboard indisponible"
        body="Votre role ne permet pas d'afficher le tableau de bord."
      />
    );
  }

  if (page.widgetsQuery.error && !page.widgetsResponse) {
    return (
      <PanelState
        illustration="note"
        title="Dashboard indisponible"
        body="Impossible de charger les cartes du tableau de bord."
      />
    );
  }

  return (
    <div className="min-w-0 space-y-6">
      <WelcomeWidget />

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
          illustration="note"
          title="Aucune carte disponible"
          body="Aucune carte ne correspond a vos permissions actuelles."
        />
      )}
    </div>
  );
}
