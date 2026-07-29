import { getEmptyIllustration, type EmptyIllustration } from "../../../../shared/illustrations/emptyIllustrations";
import { useTheme } from "../../../../shared/theme/ThemeProvider";

type FilesEmptyIllustrationProps = {
  illustration?: EmptyIllustration;
};

export function FilesEmptyIllustration({ illustration = "file" }: FilesEmptyIllustrationProps) {
  const { dark } = useTheme();

  return (
    <img
      alt=""
      aria-hidden="true"
      className="files-empty-illustration"
      loading="lazy"
      src={getEmptyIllustration(illustration, dark)}
    />
  );
}
