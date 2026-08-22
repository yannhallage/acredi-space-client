import type { PollListItem, PollStatus, PollVisibility } from "../../shared/api/polls";

export const pollSkeletonKeys = [
  "poll-skel-1",
  "poll-skel-2",
  "poll-skel-3",
  "poll-skel-4",
  "poll-skel-5",
  "poll-skel-6",
] as const;

export type PollCardModel = {
  id: string;
  title: string;
  status: PollStatus;
  visibility: PollVisibility;
  statusLabel: string;
  visibilityLabel: string;
  closesLabel: string | null;
  publishedLabel: string | null;
  updatedLabel: string;
  canRespond: boolean;
  canEdit: boolean;
};

const STATUS_LABELS: Record<PollStatus, string> = {
  DRAFT: "Brouillon",
  SCHEDULED: "Planifié",
  PUBLISHED: "Publié",
  CLOSED: "Fermé",
  ARCHIVED: "Archivé",
};

const VISIBILITY_LABELS: Record<PollVisibility, string> = {
  ORGANIZATION: "Organisation",
  TEAM: "Équipe",
  CHANNEL: "Salon",
  PRIVATE: "Privé",
};

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function getPollStatusLabel(status: PollStatus) {
  return STATUS_LABELS[status];
}

export function getPollVisibilityLabel(visibility: PollVisibility) {
  return VISIBILITY_LABELS[visibility];
}

export function formatPollDate(date: Date | null) {
  if (!date) {
    return null;
  }

  return dateFormatter.format(date);
}

export function formatClosesLabel(closesAt: Date | null) {
  if (!closesAt) {
    return null;
  }

  const diff = closesAt.getTime() - Date.now();
  if (diff <= 0) {
    return "Clôturé";
  }

  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days <= 1) {
    return "Ferme aujourd'hui";
  }

  if (days <= 7) {
    return `Ferme dans ${days} j`;
  }

  return `Ferme le ${formatPollDate(closesAt)}`;
}

export function mapPollToCard(poll: PollListItem): PollCardModel {
  return {
    id: poll.id,
    title: poll.title,
    status: poll.status,
    visibility: poll.visibility,
    statusLabel: getPollStatusLabel(poll.status),
    visibilityLabel: getPollVisibilityLabel(poll.visibility),
    closesLabel: formatClosesLabel(poll.closesAt),
    publishedLabel: formatPollDate(poll.publishedAt),
    updatedLabel: formatPollDate(poll.updatedAt) ?? "",
    canRespond: poll.status === "PUBLISHED",
    canEdit: poll.status === "DRAFT" || poll.status === "SCHEDULED",
  };
}

export const DONUT_COLORS = [
  "#2f343a",
  "#6b7280",
  "#a1a7b0",
  "#c8ccd2",
  "#e5e7eb",
];

export function buildDonutSegments(
  options: Array<{ optionId: string; label: string; count: number }>
) {
  const total = options.reduce((sum, option) => sum + option.count, 0);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  if (total === 0) {
    return {
      total: 0,
      radius,
      circumference,
      segments: [
        {
          id: "empty",
          label: "Aucun vote",
          count: 0,
          color: DONUT_COLORS[4],
          dasharray: `${circumference} ${circumference}`,
          dashoffset: 0,
          percentage: 0,
        },
      ],
    };
  }

  const segments = options.map((option, index) => {
    const percentage = (option.count / total) * 100;
    const length = (option.count / total) * circumference;
    const segment = {
      id: option.optionId,
      label: option.label,
      count: option.count,
      color: DONUT_COLORS[index % DONUT_COLORS.length],
      dasharray: `${length} ${circumference - length}`,
      dashoffset: -offset,
      percentage,
    };
    offset += length;
    return segment;
  });

  return { total, radius, circumference, segments };
}
