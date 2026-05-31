import { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  emoji?: string;
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  emoji
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-in fade-in duration-500" data-testid="empty-state">
      <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 shadow-sm">
        {emoji ? (
          <span className="text-4xl">{emoji}</span>
        ) : Icon ? (
          <Icon className="w-10 h-10 text-gray-400 dark:text-gray-500" strokeWidth={1.5} />
        ) : null}
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="rounded-full px-8 shadow-sm hover:-translate-y-0.5 transition-transform" data-testid="empty-state-action-btn">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
