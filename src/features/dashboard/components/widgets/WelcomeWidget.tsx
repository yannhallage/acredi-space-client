import { useCurrentOrganizationQuery } from "../../../../shared/api/organizations";
import { useAuth } from "../../../../shared/context";

const WELCOME_ILLUSTRATION_SRC = "/dashboard/welcome-team.jpg";

function OrganizationName({
  loading,
  name,
}: {
  loading: boolean;
  name: string;
}) {
  if (loading) {
    return (
      <span
        aria-hidden="true"
        className="inline-block h-[1em] w-[8.5rem] translate-y-0.5 animate-pulse rounded-md bg-[var(--surface-2)] align-middle"
      />
    );
  }

  return <span className="break-words">{name || "ton organisation"}</span>;
}

export function WelcomeWidget() {
  const { user } = useAuth();
  const organizationQuery = useCurrentOrganizationQuery(true);
  const firstName = user?.name?.split(" ")[0] ?? "Utilisateur";
  const organizationName =
    organizationQuery.data?.name?.trim() || user?.organizationName?.trim() || "";
  const showOrganizationSkeleton = organizationQuery.loading && !organizationName;

  return (
    <section className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-[0_2px_10px_rgba(0,0,0,0.08)]">
      <div className="flex min-h-[220px] flex-col lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col justify-center px-6 py-6 sm:px-8 sm:py-8">
          <p className="text-[15px] font-medium text-[var(--accent)]">Bonjour {firstName} 👋</p>
          <h1 className="mt-2 max-w-xl text-[22px] font-semibold leading-snug tracking-tight text-[var(--text)] sm:text-[26px]">
            Voici ton organisation,{" "}
            <OrganizationName loading={showOrganizationSkeleton} name={organizationName} />
          </h1>
          <p className="mt-3 max-w-md text-[13px] leading-6 text-[var(--muted-soft)]">
            C'est ton espace : fichiers, réunions et collègues de{" "}
            <OrganizationName loading={showOrganizationSkeleton} name={organizationName} />{" "}
            t'attendent ici.
          </p>
          {/* <button
            className="mt-6 inline-flex h-10 w-fit items-center rounded-lg bg-[var(--accent)] px-4 text-[13px] font-medium text-white transition hover:opacity-90"
            type="button"
          >
            Voir mon espace
          </button> */}
        </div>

        <div className="relative h-[180px] w-full shrink-0 sm:h-[210px] lg:h-auto lg:min-h-[240px] lg:w-[46%]">
          <img
            alt={organizationName ? `Équipe ${organizationName}` : "Équipe de l'organisation"}
            className="absolute inset-0 h-full w-full object-cover object-center"
            src={WELCOME_ILLUSTRATION_SRC}
          />
        </div>
      </div>
    </section>
  );
}
