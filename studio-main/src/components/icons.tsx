import type { SVGProps } from "react";

export function AppLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-primary"
      {...props}
    >
      <path d="M10 2v2.34c0 .34.23.64.57.75L12 5.5l1.43-.41c.34-.1.57-.4.57-.75V2" />
      <path d="M14.24 3.52a6.5 6.5 0 0 0-4.48 0" />
      <path d="M15.5 6.42a4.5 4.5 0 0 0-7 0" />
      <path d="M8 14h8" />
      <path d="M8 18h8" />
      <path d="M10 10h4" />
      <path d="M7.5 5.57A4.5 4.5 0 0 1 12 4.5a4.5 4.5 0 0 1 4.5 1.07" />
      <path d="M17.89 8.11C19.9 10.59 19.5 14.6 17 17c-2.2 2.1-5.8 2.5-8.3 1s-4.1-5.1-2-7.3c1.3-1.4 3.4-1.9 5.3-1.4" />
    </svg>
  );
}
