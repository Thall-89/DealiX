export default function ProtectedLoading() {
  return <div aria-label="Loading workspace" className="space-y-6 animate-pulse"><div className="h-44 rounded-[28px] border border-white/10 bg-white/5" /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-32 rounded-[24px] border border-white/10 bg-white/5" />)}</div><div className="h-80 rounded-[28px] border border-white/10 bg-white/5" /></div>;
}
