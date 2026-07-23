import { useState } from 'react';
import { CheckIcon, LinkIcon } from '../icons/icons';

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };

  return (
    <button
      type="button"
      className="share-btn"
      aria-label="Copy link"
      title="Copy link"
      onClick={copy}
    >
      {copied ? <CheckIcon /> : <LinkIcon />}
    </button>
  );
}
