import "./button.css";

export type ButtonProps = {
  type: "button" | "linkButton" | "submit";
  text: string;
  url?: string;
  kind?: "primary" | "secondary" | "tertiary";
};

export default function Button({ type, text, url, kind }: ButtonProps) {
  return type === "linkButton" ? (
    <a href={url} className="link-button">
      {text}
    </a>
  ) : (
    <button type={type} className={kind}>
      {text}
    </button>
  );
}
