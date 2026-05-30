import { AlertCircle, Home, RefreshCcw } from 'lucide-react';
import { Button } from './Button';
import { useNavigate } from 'react-router-dom';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showHome?: boolean;
}

export const ErrorState = ({
  title = 'Something went wrong',
  message = 'We encountered an error while processing your request. Please try again.',
  onRetry,
  showHome = true
}: ErrorStateProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-in fade-in zoom-in-95 duration-300">
      <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6 text-red-500">
        <AlertCircle className="w-8 h-8" strokeWidth={2} />
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-8 leading-relaxed">
        {message}
      </p>
      <div className="flex items-center gap-4">
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="rounded-full gap-2 hover:bg-gray-50 dark:hover:bg-gray-800">
            <RefreshCcw className="w-4 h-4" />
            Try Again
          </Button>
        )}
        {showHome && (
          <Button onClick={() => navigate('/')} className="rounded-full gap-2">
            <Home className="w-4 h-4" />
            Go Home
          </Button>
        )}
      </div>
    </div>
  );
};
