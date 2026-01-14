import { Database, Settings, HelpCircle, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Header() {
  return (
    <header className="h-12 border-b border-border bg-card flex items-center justify-between px-4">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Database className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">MongoDB Studio</h1>
            <p className="text-[10px] text-muted-foreground -mt-0.5">Query & Explore</p>
          </div>
        </div>
      </div>

      {/* Center - Connection Info */}
      <div className="flex items-center gap-2 bg-secondary/50 rounded-full px-4 py-1.5">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
        <span className="text-xs font-medium">localhost:27017</span>
        <span className="text-xs text-muted-foreground">• MongoDB 7.0</span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Terminal className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Shell</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <HelpCircle className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Help</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Settings</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
