import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export function ErrorState({
  message = 'Failed to load analytics data',
  onRetry,
}: ErrorStateProps) {
  return (
    <motion.div
      className="flex h-[80vh] flex-col items-center justify-center space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="rounded-full bg-destructive/10 p-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <h2 className="text-xl font-semibold text-destructive">{message}</h2>
      <p className="text-muted-foreground">
        Please try again later or contact support if the problem persists.
      </p>
      <Button onClick={onRetry} variant="outline" className="mt-4">
        Try Again
      </Button>
    </motion.div>
  );
} 