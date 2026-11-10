export function Brand({ onClick }: { onClick: () => void }) {
  return (
    <a
      className="brand"
      href="#"
      aria-label="Daybook"
      onClick={(event) => {
        event.preventDefault();
        onClick();
      }}
    >
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="10" fill="#4f6f7e" />
        <path
          d="M16 10.5C13.8 8.8 10.8 8.200 7.500 8.500v14.300c3.300-.3 6.300.3 8.500 2 2.200-1.700 5.200-2.300 8.500-2V8.500c-3.300-.3-6.300.3-8.500 2z"
          fill="#ffffff"
        />
        <path d="M16 10.500v14.300" stroke="#b6c8ce" strokeWidth="1.400" />
        <path d="M19 8.700v8.100l1.800-1.400 1.800 1.400V8.600z" fill="#e0a077" />
      </svg>
      <span>Daybook</span>
    </a>
  );
}
