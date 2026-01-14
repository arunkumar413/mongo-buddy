import { useRef, useCallback, useEffect } from "react";
import Editor, { OnMount, useMonaco } from "@monaco-editor/react";
import { Play, Save, Clock, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { sampleQueries } from "@/data/mockData";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { createMongoCompletionProvider } from "@/lib/mongoAutocomplete";

interface QueryEditorProps {
  query: string;
  onQueryChange: (query: string) => void;
  onExecute: () => void;
  isExecuting: boolean;
  executionTime: string | null;
  activeCollection: string | null;
}

export function QueryEditor({
  query,
  onQueryChange,
  onExecute,
  isExecuting,
  executionTime,
  activeCollection,
}: QueryEditorProps) {
  const editorRef = useRef<unknown>(null);
  const monaco = useMonaco();
  const completionProviderRef = useRef<{ dispose: () => void } | null>(null);

  // Register MongoDB autocomplete provider
  useEffect(() => {
    if (monaco) {
      // Dispose previous provider if exists
      if (completionProviderRef.current) {
        completionProviderRef.current.dispose();
      }

      // Register new provider with current collection context
      const provider = createMongoCompletionProvider(
        monaco,
        () => activeCollection
      );
      
      completionProviderRef.current = monaco.languages.registerCompletionItemProvider(
        "javascript",
        provider
      );

      return () => {
        if (completionProviderRef.current) {
          completionProviderRef.current.dispose();
        }
      };
    }
  }, [monaco, activeCollection]);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      onExecute();
    }
  }, [onExecute]);

  return (
    <div className="h-full flex flex-col panel" onKeyDown={handleKeyDown}>
      {/* Toolbar */}
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Query</span>
          {activeCollection && (
            <span className="text-xs text-primary font-mono bg-primary/10 px-2 py-0.5 rounded">
              {activeCollection}
            </span>
          )}
          {executionTime && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {executionTime}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <BookOpen className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Sample Queries</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="w-64">
              {sampleQueries.map((sample, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={() => onQueryChange(sample.query)}
                  className="flex flex-col items-start"
                >
                  <span className="font-medium text-xs">{sample.name}</span>
                  <span className="text-[10px] text-muted-foreground font-mono truncate w-full">
                    {sample.query.slice(0, 40)}...
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Save className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Save Query</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onQueryChange("")}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear</TooltipContent>
          </Tooltip>

          <Button
            size="sm"
            onClick={onExecute}
            disabled={isExecuting || !query.trim()}
            className="h-7 px-3 gap-1.5 bg-primary hover:bg-primary/90"
          >
            <Play className="h-3.5 w-3.5" />
            {isExecuting ? "Running..." : "Execute"}
            <kbd className="hidden sm:inline-flex ml-1 text-[10px] bg-primary-foreground/20 px-1 rounded">
              ⌘↵
            </kbd>
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 glow-focus rounded-b-lg overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          value={query}
          onChange={(value) => onQueryChange(value || "")}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            wordWrap: "on",
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
            renderLineHighlight: "all",
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
            tabSize: 2,
            folding: true,
            bracketPairColorization: { enabled: true },
            quickSuggestions: true,
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: "on",
            snippetSuggestions: "inline",
          }}
        />
      </div>
    </div>
  );
}
