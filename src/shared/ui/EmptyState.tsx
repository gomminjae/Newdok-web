import type { ReactNode } from 'react';

type Props = {
  icon?: ReactNode;
  title: string;
  description?: string;
  cta?: ReactNode;
};

export function EmptyState({ icon, title, description, cta }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-3">
      {icon}
      <p className="text-base font-bold text-caption-heavy whitespace-pre-line">
        {title}
      </p>
      {description && (
        <p className="text-sm text-caption-alternative whitespace-pre-line">
          {description}
        </p>
      )}
      {cta && <div className="mt-4">{cta}</div>}
    </div>
  );
}
