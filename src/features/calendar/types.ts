export type ViewMode = "list" | "month" | "week" | "day";

export type CreateSlot = {
  endsAt: string;
  startsAt: string;
};

export type ToastState = {
  intent: "success" | "info" | "warning" | "error";
  message: string;
  show: boolean;
};
