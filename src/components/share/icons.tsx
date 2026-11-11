/**
 * Inline 24x24 icons for the share bar and the menu: no icon font, no request.
 * They inherit `currentColor` and are always decorative (aria-hidden): every
 * control that shows one carries its own accessible name.
 */
export type IconName =
  | "whatsapp"
  | "telegram"
  | "x"
  | "facebook"
  | "email"
  | "link"
  | "check"
  | "share"
  | "menu"
  | "close"
  | "caret";

const STROKE = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const PATHS: Record<IconName, React.ReactNode> = {
  whatsapp: (
    <>
      <path {...STROKE} strokeWidth={1.8} d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.4z" />
      <path
        fill="currentColor"
        d="M8.6 7.6c.2-.4.4-.5.8-.5h.5c.2 0 .4.1.5.4l.7 1.7c.1.2.1.4-.1.6l-.5.6c-.1.2-.2.3-.1.5.5.9 1.3 1.7 2.3 2.2.2.1.3.1.5-.1l.6-.7c.2-.2.3-.2.5-.1l1.7.8c.2.1.4.2.4.4 0 .5-.2 1.2-.8 1.5-.6.4-1.5.5-2.9-.1-1.8-.8-3.4-2.4-4.1-3.9-.5-1.2-.4-2.3 0-3.3z"
      />
    </>
  ),
  telegram: (
    <path
      fill="currentColor"
      d="M21.4 4.2 2.9 11.3c-1 .4-1 1.1-.2 1.4l4.7 1.5 1.8 5.6c.2.6.4.8.9.8.4 0 .6-.2.9-.4l2.3-2.2 4.7 3.5c.9.5 1.5.2 1.7-.8l3.1-14.7c.3-1.3-.5-1.9-1.4-1.5zM9.6 14.1l8.7-5.5c.4-.3.8-.1.5.2l-7.2 6.5-.3 3z"
    />
  ),
  x: (
    <path
      fill="currentColor"
      d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.78zm-1.08 16.2h1.7L7.4 4.73H5.58z"
    />
  ),
  facebook: (
    <path
      fill="currentColor"
      d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21z"
    />
  ),
  email: (
    <>
      <rect {...STROKE} x="3" y="5" width="18" height="14" rx="2" />
      <path {...STROKE} d="m3.5 6.5 8.5 6.5 8.5-6.5" />
    </>
  ),
  link: (
    <>
      <path {...STROKE} d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.2 1.2" />
      <path {...STROKE} d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2" />
    </>
  ),
  check: <path {...STROKE} d="m5 12.5 4.5 4.5L19 7.5" />,
  share: (
    <>
      <circle {...STROKE} cx="18" cy="5" r="2.5" />
      <circle {...STROKE} cx="6" cy="12" r="2.5" />
      <circle {...STROKE} cx="18" cy="19" r="2.5" />
      <path {...STROKE} d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4" />
    </>
  ),
  menu: <path {...STROKE} d="M4 7h16M4 12h16M4 17h16" />,
  close: <path {...STROKE} d="M6 6l12 12M18 6 6 18" />,
  caret: <path {...STROKE} d="m7 10 5 5 5-5" />,
};

export function ShareIcon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden="true"
      focusable="false"
      className={className ?? "ci-icon"}
    >
      {PATHS[name]}
    </svg>
  );
}
