import { Icon } from './Icon';

export function Toast({ message }: { message: string }) {
  return <div role="status" className="fixed bottom-[calc(var(--tabbar-height)+env(safe-area-inset-bottom)+16px)] left-6 right-6 z-50 mx-auto flex min-h-14 max-w-[600px] items-center justify-center gap-2 rounded-[8px] bg-primary px-4 py-3 text-sm font-medium text-white motion-safe:animate-[pageEnter_0.2s_ease-out] md:bottom-6 md:left-[calc(var(--sidebar-width)+24px)]">
    <Icon name="Line Check circle" size={14} />
    {message}
  </div>;
}
