import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface TestTimerProps {
  timeRemaining: number;
}

export default function TestTimer({ timeRemaining }: TestTimerProps) {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  
  const isWarning = timeRemaining <= 300; // Last 5 minutes
  const isCritical = timeRemaining <= 60; // Last minute

  return (
    <div className="test-timer">
      <Card className={`${isCritical ? 'border-red-500' : isWarning ? 'border-yellow-500' : ''}`}>
        <CardContent className="p-4">
          <div className="text-center">
            <div className={`text-2xl font-bold mb-1 ${isCritical ? 'text-red-500' : isWarning ? 'text-yellow-600' : 'text-primary'}`} data-testid="text-timer">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Time Remaining
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
