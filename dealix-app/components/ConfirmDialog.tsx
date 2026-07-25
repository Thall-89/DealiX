"use client";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, description, confirmLabel, danger = false, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title"><div className="w-full max-w-md rounded-[28px] border border-white/10 bg-slate-950 p-6 shadow-[0_24px_80px_rgba(2,12,27,0.5)]"><h2 id="confirm-dialog-title" className="text-xl font-semibold text-white">{title}</h2><p className="mt-3 text-sm leading-6 text-zinc-400">{description}</p><div className="mt-6 flex justify-end gap-3"><button onClick={onCancel} className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300">Cancel</button><button onClick={onConfirm} className={`rounded-full px-4 py-2 text-sm font-medium text-white ${danger ? "bg-rose-500 hover:bg-rose-400" : "bg-sky-500 hover:bg-sky-400"}`}>{confirmLabel}</button></div></div></div>;
}
