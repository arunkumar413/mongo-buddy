import { useState, useCallback, useEffect } from "react";
import { Header } from "@/components/Header";
import { DatabaseSidebar } from "@/components/DatabaseSidebar";
import { QueryEditor } from "@/components/QueryEditor";
import { ResultsPanel } from "@/components/ResultsPanel";
import { QueryHistory } from "@/components/QueryHistory";
import { StatusBar } from "@/components/StatusBar";
import { type Document } from "@/data/mockData";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const defaultQuery = `// Select a collection and write your query
// Examples:
db.users.find({})
db.products.find({ price: { $lt: 100 } })`;

const API_URL = "http://localhost:3001/api";

const Index = () => {
  const [selectedCollection, setSelectedCollection] = useState<{
    db: string;
    collection: string;
  } | null>(null);
  const [query, setQuery] = useState(defaultQuery);
  const [results, setResults] = useState<Document[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionTime, setExecutionTime] = useState<string | null>(null);

  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState(true);
  const [connectionUri, setConnectionUri] = useState("mongodb://localhost:27017");
  const [isConnecting, setIsConnecting] = useState(false);
  const [databases, setDatabases] = useState<any[]>([]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const res = await fetch(`${API_URL}/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uri: connectionUri }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to connect");
      }

      setIsConnected(true);
      setShowConnectDialog(false);
      toast.success("Connected to MongoDB");
      fetchDatabases();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Connection failed");
    } finally {
      setIsConnecting(false);
    }
  };

  const fetchDatabases = async () => {
    try {
      const res = await fetch(`${API_URL}/databases`);
      if (!res.ok) throw new Error("Failed to fetch databases");
      const data = await res.json();
      setDatabases(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load databases");
    }
  };

  const handleSelectCollection = useCallback((db: string, collection: string) => {
    setSelectedCollection({ db, collection });
    setQuery(`db.${collection}.find({})`);
    // Optionally auto-execute or just clear results
    setResults([]);
    setError(null);
    setExecutionTime(null);
  }, []);

  const handleExecuteQuery = useCallback(async () => {
    if (!selectedCollection) {
      toast.error("Please select a collection first");
      return;
    }

    setIsExecuting(true);
    setError(null);
    const startTime = performance.now();

    try {
      const res = await fetch(`${API_URL}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          dbName: selectedCollection.db
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Query execution failed");
      }

      setResults(Array.isArray(data) ? data : [data]);
      const endTime = performance.now();
      setExecutionTime(`${Math.round(endTime - startTime)}ms`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Query execution failed");
      setResults([]);
    } finally {
      setIsExecuting(false);
    }
  }, [query, selectedCollection]);

  const handleSelectFromHistory = useCallback((historyQuery: string) => {
    setQuery(historyQuery);
  }, []);

  const handleRefreshDatabases = useCallback(() => {
    fetchDatabases();
  }, []);

  const handleNewConnection = useCallback(() => {
    setShowConnectDialog(true);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Database Sidebar */}
          <ResizablePanel defaultSize={18} minSize={15} maxSize={30}>
            <DatabaseSidebar
              onSelectCollection={handleSelectCollection}
              selectedCollection={selectedCollection}
              databases={databases}
              onRefresh={handleRefreshDatabases}
              onNewConnection={handleNewConnection}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Main Content */}
          <ResizablePanel defaultSize={62}>
            <ResizablePanelGroup direction="vertical">
              {/* Query Editor */}
              <ResizablePanel defaultSize={40} minSize={20}>
                <QueryEditor
                  query={query}
                  onQueryChange={setQuery}
                  onExecute={handleExecuteQuery}
                  isExecuting={isExecuting}
                  executionTime={executionTime}
                  activeCollection={selectedCollection?.collection || null}
                />
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Results Panel */}
              <ResizablePanel defaultSize={60} minSize={30}>
                <ResultsPanel results={results} error={error} />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Query History */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <QueryHistory onSelectQuery={handleSelectFromHistory} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <StatusBar
        selectedCollection={selectedCollection}
        documentCount={results.length}
      />

      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect to MongoDB</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="uri">Connection String</Label>
              <Input
                id="uri"
                value={connectionUri}
                onChange={(e) => setConnectionUri(e.target.value)}
                placeholder="mongodb://localhost:27017"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConnectDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConnect} disabled={isConnecting}>
              {isConnecting ? "Connecting..." : "Connect"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
