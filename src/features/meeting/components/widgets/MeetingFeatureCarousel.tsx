import { useState } from "react";
import { Icon } from "../../../../shared/ui";

const SLIDES = [
  {
    image: "/meeting/user_edu_get_a_link_light_90698cd7b4ca04d3005c962a3756c42d.svg",
    title: "Obtenez un lien que vous pouvez partager",
    description:
      "Cliquez sur Nouvelle réunion pour obtenir un lien que vous pouvez envoyer aux personnes que vous voulez inviter",
  },
  {
    image: "/meeting/user_edu_safety_light_e04a2bbb449524ef7e49ea36d5f25b65.svg",
    title: "Votre réunion est sécurisée",
    description:
      "Personne ne peut rejoindre une réunion sans y avoir été invité ou admis par l'organisateur",
  },
  {
    image: "/meeting/user_edu_scheduling_light_b352efa017e4f8f1ffda43e847820322.svg",
    title: "Planifiez à l'avance",
    description:
      "Cliquez sur Nouvelle réunion pour planifier des réunions dans votre calendrier Acredi Space",
  },
] as const;

export function MeetingFeatureCarousel() {
  const [index, setIndex] = useState(1);
  const slide = SLIDES[index];

  const goPrevious = () => {
    setIndex((current) => (current === 0 ? SLIDES.length - 1 : current - 1));
  };

  const goNext = () => {
    setIndex((current) => (current === SLIDES.length - 1 ? 0 : current + 1));
  };

  return (
    <section className="mt-10 flex w-full max-w-[720px] flex-col items-center px-4">
      <div className="flex w-full items-center justify-center gap-3 sm:gap-6">
        <button
          type="button"
          onClick={goPrevious}
          aria-label="Diapositive précédente"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted)] transition hover:bg-[var(--surface-2)]"
        >
          <Icon name="arrowLeft" size={18} />
        </button>

        <div className="flex min-w-0 flex-1 flex-col items-center text-center">
          <img
            src={slide.image}
            alt=""
            className="h-[220px] w-[220px] object-contain sm:h-[280px] sm:w-[280px]"
            draggable={false}
          />
          <h2 className="mt-5 text-[20px] font-medium leading-snug text-[var(--text)] sm:text-[22px]">
            {slide.title}
          </h2>
          <p className="mt-2 max-w-[420px] text-[14px] leading-relaxed text-[var(--muted-soft)]">
            {slide.description}
          </p>
        </div>

        <button
          type="button"
          onClick={goNext}
          aria-label="Diapositive suivante"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted)] transition hover:bg-[var(--surface-2)]"
        >
          <Icon name="arrowRight" size={18} />
        </button>
      </div>

      <div className="mt-6 flex items-center gap-2">
        {SLIDES.map((item, slideIndex) => (
          <button
            key={item.title}
            type="button"
            aria-label={`Aller à la diapositive ${slideIndex + 1}`}
            aria-current={slideIndex === index}
            onClick={() => setIndex(slideIndex)}
            className={`h-2 w-2 rounded-full transition ${
              slideIndex === index
                ? "bg-[#1a73e8]"
                : "bg-[color-mix(in_srgb,var(--muted)_35%,transparent)]"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
