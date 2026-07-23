interface LogoPlaceholderProps {
  name: string;
}

export function LogoPlaceholder({ name }: LogoPlaceholderProps) {
  return (
    <span
      style={{
        fontFamily: "var(--th-font-mono)",
        fontSize: "0.75rem",
        color: "var(--th-color-text-3)",
        whiteSpace: "nowrap",
      }}
    >
      {name}
    </span>
  );
}
