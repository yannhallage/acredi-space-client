type ChecklistEmptyArtProps = {
  className?: string;
};

export function ChecklistEmptyArt({ className }: ChecklistEmptyArtProps) {
  const classes = ["cl-empty-art", className].filter(Boolean).join(" ");

  return (
    <>
      <img
        className={`${classes} cl-empty-art-light`}
        src="/checklists/empty-tasks-light.svg"
        alt=""
        draggable={false}
      />
      <img
        className={`${classes} cl-empty-art-dark`}
        src="/checklists/empty-tasks-dark.svg"
        alt=""
        draggable={false}
      />
    </>
  );
}
