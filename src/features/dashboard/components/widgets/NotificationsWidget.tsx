import type { WidgetComponentProps } from "../../constants";
import { NotificationsList } from "./NotificationsList";

export function NotificationsWidget({ context }: WidgetComponentProps) {
  return (
    <NotificationsList
      isLoading={context.isNotificationsLoading}
      notifications={context.notifications}
    />
  );
}

export function MyNotificationsWidget({ context }: WidgetComponentProps) {
  return (
    <NotificationsList
      isLoading={context.isNotificationsLoading}
      notifications={context.notifications}
    />
  );
}
