interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
}

export function EmptyState({ title, description, actionLabel }: EmptyStateProps) {
  return (
    <div className="rounded-[24px] border border-dashed border-white/15 bg-white/5 p-10 text-center">
      <div className="text-xl font-semibold text-white">{title}</div>
      <p className="mt-2 text-sm leading-7 text-zinc-400">{description}</p>
      {actionLabel ? (
        <button className="mt-4 rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-200">
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
