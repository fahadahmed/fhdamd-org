import { Button } from "@fhdamd/threads";

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
  </svg>
);

export interface AppStoreButtonProps {
  href: string;
}

/** The one filled button on its surface. */
export default function AppStoreButton({ href }: Readonly<AppStoreButtonProps>) {
  return (
    <Button href={href} variant="solid-terra" size="lg" icon={<DownloadIcon />} iconPosition="start">
      Download on the App Store
    </Button>
  );
}
