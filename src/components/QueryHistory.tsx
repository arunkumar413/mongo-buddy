import { memo } from "react";
import { Clock, Play, Trash2 } from "lucide-react";
import { queryHistory } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface QueryHistoryProps {
  onSelectQuery: (query: string) => void;
}

export const QueryHistory = memo(function QueryHistory({ onSelectQuery }: QueryHistoryProps) {
  return (
    <div className="h-full flex flex-col bg-sidebar border-l border-border">
      {/* Header */}
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">History</span>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Clear History</TooltipContent>
        </Tooltip>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {queryHistory.map((item, index) => (
          <HistoryItem
            key={index}
            query={item.query}
            timestamp={item.timestamp}
            duration={item.duration}
            onSelect={() => onSelectQuery(item.query)}
          />
        ))}
      </div>
    </div>
  );
});

interface HistoryItemProps {
  query: string;
  timestamp: string;
  duration: string;
  onSelect: () => void;
}

function HistoryItem({ query, timestamp, duration, onSelect }: HistoryItemProps) {
  return (
    <div className="group border-b border-border hover:bg-muted/50 transition-colors">
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <code className="text-xs font-mono text-foreground line-clamp-2 flex-1">
            {query}
          </code>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                onClick={onSelect}
              >
                <Play className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Load Query</TooltipContent>
          </Tooltip>
        </div>
        <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
          <span>{timestamp}</span>
          <span className="text-primary">{duration}</span>
        </div>
      </div>
    </div>
  );
}
