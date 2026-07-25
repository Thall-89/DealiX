interface ActionCardProps {
  title: string;
  description: string;
  href: string;
  accent?: "sky" | "purple" | "slate";
}

export function ActionCard({ title, description, href, accent = "slate" }: ActionCardProps) {
  const accentClasses = {
    sky: "border-sky-400/20 bg-sky-500/10 text-sky-200",
    purple: "border-purple-400/20 bg-purple-500/10 text-purple-200",
    slate: "border-white/10 bg-white/5 text-zinc-200",
  };

  return (
    <a href={href} className={`block rounded-[24px] border p-4 transition hover:border-sky-400/30 hover:bg-sky-500/10 ${accentClasses[accent]}`}>
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-2 text-sm opacity-80">{description}</div>
    </a>
  );
}
