import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <header className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_rgba(2,12,27,0.45)] backdrop-blur-xl sm:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          {eyebrow ? (
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-sm font-medium text-purple-300">
              <span className="h-2 w-2 rounded-full bg-purple-400" />
              {eyebrow}
            </div>
          ) : null}
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1>
          <p className="mt-3 text-base leading-7 text-zinc-300">{description}</p>
        </div>
        {action ? <div>{action}</div> : null}
      </div>
    </header>
  );
}
