import { useState } from "react";
import { Table, Code, Copy, Download, ChevronDown, ChevronRight, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { type Document } from "@/data/mockData";

interface ResultsPanelProps {
  results: Document[];
  error: string | null;
}

type ViewMode = "table" | "json";

export function ResultsPanel({ results, error }: ResultsPanelProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  const copyResults = () => {
    navigator.clipboard.writeText(JSON.stringify(results, null, 2));
  };

  const downloadResults = () => {
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "query-results.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <div className="h-full flex flex-col panel">
        <div className="panel-header">
          <span className="text-sm font-semibold text-destructive">Error</span>
        </div>
        <div className="flex-1 p-4">
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
            <pre className="text-sm text-destructive font-mono whitespace-pre-wrap">
              {error}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col panel">
      {/* Header */}
      <div className="panel-header">
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold">Results</span>
          <span className="text-xs text-muted-foreground">
            {results.length} document{results.length !== 1 ? "s" : ""}
          </span>

          {/* View Toggle */}
          <div className="flex items-center bg-secondary rounded-md p-0.5">
            <button
              onClick={() => setViewMode("table")}
              className={`tab-button px-2 py-1 rounded text-xs flex items-center gap-1 border-0 ${
                viewMode === "table" ? "bg-muted text-foreground" : "text-muted-foreground"
              }`}
            >
              <Table className="h-3 w-3" />
              Table
            </button>
            <button
              onClick={() => setViewMode("json")}
              className={`tab-button px-2 py-1 rounded text-xs flex items-center gap-1 border-0 ${
                viewMode === "json" ? "bg-muted text-foreground" : "text-muted-foreground"
              }`}
            >
              <Code className="h-3 w-3" />
              JSON
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={copyResults}>
                <Copy className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy to Clipboard</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={downloadResults}>
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download JSON</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto scrollbar-thin">
        {results.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <FileJson className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No documents found</p>
              <p className="text-xs mt-1">Execute a query to see results</p>
            </div>
          </div>
        ) : viewMode === "table" ? (
          <TableView results={results} expandedRows={expandedRows} toggleRow={toggleRow} />
        ) : (
          <JsonView results={results} />
        )}
      </div>
    </div>
  );
}

interface TableViewProps {
  results: Document[];
  expandedRows: Set<number>;
  toggleRow: (index: number) => void;
}

function TableView({ results, expandedRows, toggleRow }: TableViewProps) {
  // Get all unique keys from results
  const allKeys = Array.from(
    new Set(results.flatMap((doc) => Object.keys(doc)))
  );

  return (
    <div className="min-w-full">
      <table className="w-full text-xs">
        <thead className="bg-muted sticky top-0">
          <tr>
            <th className="w-8 px-2 py-2"></th>
            {allKeys.map((key) => (
              <th
                key={key}
                className="px-3 py-2 text-left font-semibold text-muted-foreground border-r border-border last:border-r-0"
              >
                {key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {results.map((doc, index) => (
            <TableRow
              key={doc._id}
              doc={doc}
              index={index}
              keys={allKeys}
              isExpanded={expandedRows.has(index)}
              onToggle={() => toggleRow(index)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface TableRowProps {
  doc: Document;
  index: number;
  keys: string[];
  isExpanded: boolean;
  onToggle: () => void;
}

function TableRow({ doc, keys, isExpanded, onToggle }: TableRowProps) {
  const hasNestedData = Object.values(doc).some(
    (v) => typeof v === "object" && v !== null
  );

  return (
    <>
      <tr className="border-b border-border hover:bg-muted/50 transition-colors">
        <td className="px-2 py-2">
          {hasNestedData && (
            <button onClick={onToggle} className="text-muted-foreground hover:text-foreground">
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          )}
        </td>
        {keys.map((key) => (
          <td key={key} className="px-3 py-2 border-r border-border last:border-r-0">
            <CellValue value={doc[key]} />
          </td>
        ))}
      </tr>
      {isExpanded && hasNestedData && (
        <tr className="bg-editor-bg">
          <td colSpan={keys.length + 1} className="p-0">
            <pre className="p-4 text-xs font-mono text-muted-foreground overflow-x-auto">
              {JSON.stringify(doc, null, 2)}
            </pre>
          </td>
        </tr>
      )}
    </>
  );
}

function CellValue({ value }: { value: unknown }) {
  if (value === null) {
    return <span className="text-muted-foreground italic">null</span>;
  }
  if (value === undefined) {
    return <span className="text-muted-foreground italic">undefined</span>;
  }
  if (typeof value === "boolean") {
    return (
      <span className={value ? "text-success" : "text-destructive"}>
        {value.toString()}
      </span>
    );
  }
  if (typeof value === "number") {
    return <span className="text-info">{value}</span>;
  }
  if (typeof value === "object") {
    return (
      <span className="text-warning font-mono">
        {Array.isArray(value) ? `[${value.length}]` : "{...}"}
      </span>
    );
  }
  return <span className="truncate max-w-[200px] block">{String(value)}</span>;
}

function JsonView({ results }: { results: Document[] }) {
  return (
    <pre className="p-4 text-xs font-mono text-foreground whitespace-pre-wrap">
      {JSON.stringify(results, null, 2)}
    </pre>
  );
}
