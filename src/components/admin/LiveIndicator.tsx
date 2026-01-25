import { formatDistanceToNow } from 'date-fns';
import { Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveIndicatorProps {
  isConnected: boolean;
  lastUpdate: Date | null;
  className?: string;
}

export const LiveIndicator = ({ isConnected, lastUpdate, className }: LiveIndicatorProps) => {
  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      <div className="flex items-center gap-1.5">
        {isConnected ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <Wifi className="h-3.5 w-3.5 text-green-500" />
          </>
        ) : (
          <>
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <WifiOff className="h-3.5 w-3.5 text-red-500" />
          </>
        )}
        <span className={cn(
          "font-medium",
          isConnected ? "text-green-500" : "text-red-500"
        )}>
          {isConnected ? 'Live' : 'Offline'}
        </span>
      </div>
      {lastUpdate && (
        <span className="text-xs text-muted-foreground hidden sm:inline">
          Updated {formatDistanceToNow(lastUpdate, { addSuffix: true })}
        </span>
      )}
    </div>
  );
};

export default LiveIndicator;
