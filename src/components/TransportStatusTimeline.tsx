import { Check, Circle, Package, CheckCircle2, Truck, MapPin, FileCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusTimelineProps {
  currentStatus: string;
  onStatusClick?: (status: string) => void;
  isOpsUser: boolean;
}

const statusFlow = [
  { key: 'submitted', label: 'Submitted', icon: Package },
  { key: 'approved', label: 'Approved', icon: CheckCircle2 },
  { key: 'assigned', label: 'Assigned', icon: Truck },
  { key: 'loaded', label: 'Loaded', icon: Package },
  { key: 'in_transit', label: 'In Transit', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: MapPin },
  { key: 'pod_received', label: 'POD Received', icon: FileCheck },
  { key: 'completed', label: 'Complete', icon: Check },
];

const getNextStatuses = (currentStatus: string): string[] => {
  const flow: Record<string, string[]> = {
    submitted: ['approved', 'rejected'],
    approved: ['assigned'],
    assigned: ['loaded'],
    loaded: ['in_transit'],
    in_transit: ['delivered'],
    delivered: ['pod_received'],
    pod_received: ['completed'],
    completed: ['billed'],
    billed: ['closed'],
  };
  return flow[currentStatus] || [];
};

export function TransportStatusTimeline({ currentStatus, onStatusClick, isOpsUser }: StatusTimelineProps) {
  const currentIndex = statusFlow.findIndex(s => s.key === currentStatus);
  const nextStatuses = getNextStatuses(currentStatus);

  const getStatusState = (index: number, statusKey: string) => {
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'current';
    if (nextStatuses.includes(statusKey) && isOpsUser) return 'clickable';
    return 'pending';
  };

  return (
    <div className="w-full overflow-x-unset pb-4">
      <div className="flex items-center justify-between min-w-[800px] px-4">
        {statusFlow.map((status, index) => {
          const state = getStatusState(index, status.key);
          const Icon = status.icon;
          const isClickable = state === 'clickable' && onStatusClick;
          const isLast = index === statusFlow.length - 1;

          return (
            <div key={status.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center relative">
                {/* Status Circle */}
                <button
                  onClick={() => isClickable && onStatusClick(status.key)}
                  disabled={!isClickable}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 relative z-10",
                    state === 'completed' && "bg-green-500 text-white",
                    state === 'current' && "bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110",
                    state === 'clickable' && "bg-blue-500/20 text-blue-700 hover:bg-blue-500 hover:text-white cursor-pointer hover:scale-105",
                    state === 'pending' && "bg-muted text-muted-foreground",
                    !isClickable && "cursor-default"
                  )}
                >
                  {state === 'completed' ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </button>

                {/* Status Label */}
                <div className="mt-2 text-center min-w-[80px]">
                  <p className={cn(
                    "text-xs font-medium transition-colors",
                    state === 'completed' && "text-green-600",
                    state === 'current' && "text-primary font-semibold",
                    state === 'clickable' && "text-blue-700",
                    state === 'pending' && "text-muted-foreground"
                  )}>
                    {status.label}
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className={cn(
                  "flex-1 h-0.5 mx-2 transition-colors duration-300",
                  index < currentIndex ? "bg-green-500" : "bg-muted"
                )} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
