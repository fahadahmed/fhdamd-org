import type { ReactElement } from "react";
import styles from "./EmbedCard.module.css";

interface BaseProps {
  /** Overrides the auto-derived label, e.g. "Embed · YouTube" */
  label?: string;
  className?: string;
}

export interface YoutubeEmbedProps extends BaseProps {
  type: "youtube";
  videoUrl: string;
  title: string;
}

export interface TweetEmbedProps extends BaseProps {
  type: "tweet";
  authorName: string;
  handle: string;
  text: string;
  foot?: string;
}

export interface InstagramEmbedProps extends BaseProps {
  type: "instagram";
  accountName: string;
  caption?: string;
}

export type EmbedCardProps = YoutubeEmbedProps | TweetEmbedProps | InstagramEmbedProps;

const defaultLabels: Record<EmbedCardProps["type"], string> = {
  youtube:   "Embed · YouTube",
  tweet:     "Embed · X / Twitter",
  instagram: "Embed · Instagram",
};

const YoutubeIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" />
  </svg>
);

const TweetIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
  </svg>
);

const InstagramIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const PhotoIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </svg>
);

const icons: Record<EmbedCardProps["type"], () => ReactElement> = {
  youtube: YoutubeIcon,
  tweet: TweetIcon,
  instagram: InstagramIcon,
};

export function EmbedCard(props: EmbedCardProps) {
  const Icon = icons[props.type];

  return (
    <div className={[styles.wrap, props.className].filter(Boolean).join(" ")}>
      <div className={styles.label}>
        <Icon />
        {props.label ?? defaultLabels[props.type]}
      </div>
      <div className={styles.card}>
        {props.type === "youtube" && (
          <div className={styles.video}>
            <iframe
              src={props.videoUrl}
              title={props.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        )}
        {props.type === "tweet" && (
          <div className={styles.tweet}>
            <div className={styles.tweetHead}>
              <div className={styles.tweetAvatar} />
              <div>
                <div className={styles.tweetName}>{props.authorName}</div>
                <div className={styles.tweetHandle}>{props.handle}</div>
              </div>
            </div>
            <p className={styles.tweetText}>{props.text}</p>
            {props.foot && <div className={styles.tweetFoot}>{props.foot}</div>}
          </div>
        )}
        {props.type === "instagram" && (
          <div className={styles.insta}>
            <div className={styles.instaHead}>
              <div className={styles.instaAvatar} />
              <div className={styles.instaName}>{props.accountName}</div>
            </div>
            <div className={styles.instaMedia}>
              <PhotoIcon />
            </div>
            {props.caption && <div className={styles.instaFoot}>{props.caption}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
