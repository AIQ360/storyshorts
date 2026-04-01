export default function TerminalIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 256 256"  stroke="currentColor">
  <rect fill="none" height="256" width="256" />
  <polyline
    fill="none"
    points="80 96 120 128 80 160"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="16"
  />
  <line
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="16"
    x1="136"
    x2="176"
    y1="160"
    y2="160"
  />
  <rect
    fill="none"
    height="160"
    rx="8.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="16.97"
    width="192"
    x="32"
    y="48"
  />
</svg>
  );
}
