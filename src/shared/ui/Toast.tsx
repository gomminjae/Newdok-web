export function Toast({ message }: { message: string }) {
  return <div role="status" className="fixed bottom-[calc(var(--tabbar-height)+env(safe-area-inset-bottom)+16px)] left-6 right-6 z-50 mx-auto flex min-h-14 max-w-[600px] items-center justify-center gap-2 rounded-[8px] bg-primary px-4 py-3 text-sm font-medium text-white motion-safe:animate-[pageEnter_0.2s_ease-out] sm:bottom-6 sm:left-[calc(var(--sidebar-width)+24px)]">
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0"><circle cx="7" cy="7" r="6" stroke="currentColor" /><path d="m4 7 2 2 4-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" /></svg>
    {message}
  </div>;
}
