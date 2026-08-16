interface FilterChipProps {
  label: string;
  active?: boolean;
}

export default function FilterChip({
  label,
  active = false,
}: FilterChipProps) {
  return (
    <button
      className={`rounded-full px-5 py-2 transition ${
        active
          ? "bg-blue-600 text-white"
          : "bg-white/5 text-gray-300 hover:bg-white/10"
      }`}
    >
      {label}
    </button>
  );
}