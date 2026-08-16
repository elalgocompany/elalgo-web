interface SectionTitleProps {
  badge?: string;
  title: string;
  subtitle: string;
}

export default function SectionTitle({
  badge,
  title,
  subtitle,
}: SectionTitleProps) {
  return (
    <div className="mb-14 text-center">

      {badge && (
        <p className="mb-3 text-sm uppercase tracking-[0.3em] text-blue-400">
          {badge}
        </p>
      )}

      <h2 className="text-5xl font-bold">
        {title}
      </h2>

      <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-400">
        {subtitle}
      </p>

    </div>
  );
}