type Props = {
  name: "search" | "arrow" | "pin" | "chart" | "book";
  size?: number;
};
export function Icon({ name, size = 20 }: Props) {
  const paths = {
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 4.5 4.5" />
      </>
    ),
    arrow: <path d="M4 12h15M13 6l6 6-6 6" />,
    pin: (
      <>
        <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    chart: <path d="M4 20V10m8 10V4m8 16v-7" />,
    book: <path d="M12 5v15M3 4l9 2 9-2v14l-9 2-9-2Z" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
