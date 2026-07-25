interface StatCardProps {
  label: string;
  value: string;
  hint: string;
  icon?: string;
  accent?: "sky" | "purple" | "slate";
}

export function StatCard({ label, value, hint, icon, accent = "slate" }: StatCardProps) {
  const accentClasses = {
    sky: "border-sky-400/20 hover:border-sky-400/30",
    purple: "border-purple-400/20 hover:border-purple-400/30",
    slate: "border-white/10 hover:border-sky-400/30",
  };

  return (
    <div className={`rounded-[24px] border bg-white/6 p-5 shadow-[0_20px_60px_rgba(2,12,27,0.34)] backdrop-blur-xl transition-transform duration-200 hover:-translate-y-1 ${accentClasses[accent]}`}>
      <div className="flex items-center justify-between">
        <div className="text-sm text-zinc-400">{label}</div>
        {icon ? <div className="text-xl">{icon}</div> : null}
      </div>
      <div className="mt-3 text-2xl font-semibold text-white">{value}</div>
      <div className="mt-2 text-sm text-zinc-500">{hint}</div>
    </div>
  );
}
