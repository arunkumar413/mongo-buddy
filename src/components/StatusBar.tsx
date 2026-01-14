import { Wifi, Clock, Database } from "lucide-react";

interface StatusBarProps {
  selectedCollection: { db: string; collection: string } | null;
  documentCount: number;
}

export function StatusBar({ selectedCollection, documentCount }: StatusBarProps) {
  return (
    <div className="status-bar">
      {/* Connection Status */}
      <div className="flex items-center gap-1.5">
        <Wifi className="h-3 w-3 text-primary" />
        <span>Connected</span>
      </div>

      {/* Current Collection */}
      {selectedCollection && (
        <div className="flex items-center gap-1.5">
          <Database className="h-3 w-3" />
          <span>
            {selectedCollection.db}.{selectedCollection.collection}
          </span>
          <span className="text-primary">({documentCount} docs)</span>
        </div>
      )}

      {/* Time */}
      <div className="flex items-center gap-1.5 ml-auto">
        <Clock className="h-3 w-3" />
        <span>{new Date().toLocaleTimeString()}</span>
      </div>

      {/* Version */}
      <div className="text-muted-foreground/70">
        MongoDB Studio v1.0.0
      </div>
    </div>
  );
}
