import { clsx } from 'clsx';
import type { ElementType, ReactNode } from 'react';

type Props = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
};

export function Card({ as: Component = 'div', children, className }: Props) {
  return (
    <Component className={clsx('bg-bg rounded-lg p-4', className)}>
      {children}
    </Component>
  );
}
