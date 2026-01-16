import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { DatabaseSidebar } from "@/components/DatabaseSidebar";
import { QueryEditor } from "@/components/QueryEditor";
import { ResultsPanel } from "@/components/ResultsPanel";
import { QueryHistory, type HistoryItemType } from "@/components/QueryHistory";
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
  const navigate = useNavigate();
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
  const [environments, setEnvironments] = useState<string[]>([]);
  const [selectedEnvironment, setSelectedEnvironment] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [databases, setDatabases] = useState<any[]>([]);
  const [collectionFields, setCollectionFields] = useState<string[]>([]);

  // History state
  const [history, setHistory] = useState<HistoryItemType[]>(() => {
    const saved = localStorage.getItem("queryHistory");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("queryHistory", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    fetchEnvironments();
  }, []);

  const fetchEnvironments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/environments`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.status === 401 || res.status === 403) {
        navigate("/login");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setEnvironments(data);
        if (data.length > 0) {
          setSelectedEnvironment(data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch environments:", err);
      toast.error("Failed to load environments");
    }
  };

  const addToHistory = useCallback((queryStr: string, duration: string) => {
    setHistory(prev => {
      const newItem: HistoryItemType = {
        query: queryStr,
        timestamp: new Date().toLocaleTimeString(),
        duration
      };
      // Add to top, limit to 50 items
      return [newItem, ...prev].slice(0, 50);
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const handleConnect = async () => {
    if (!selectedEnvironment) {
      toast.error("Please select an environment");
      return;
    }

    setIsConnecting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ environment: selectedEnvironment }),
      });

      if (res.status === 401 || res.status === 403) {
        navigate("/login");
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to connect");
      }

      setIsConnected(true);
      setShowConnectDialog(false);
      toast.success(`Connected to ${selectedEnvironment}`);
      fetchDatabases();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Connection failed");
    } finally {
      setIsConnecting(false);
    }
  };

  const fetchDatabases = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/databases`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.status === 401 || res.status === 403) {
        navigate("/login");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch databases");
      const data = await res.json();
      setDatabases(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load databases");
    }
  };

  const handleSelectCollection = useCallback(async (db: string, collection: string) => {
    setSelectedCollection({ db, collection });
    setQuery(`db.${collection}.find({})`);
    // Optionally auto-execute or just clear results
    setResults([]);
    setError(null);
    setExecutionTime(null);

    // Fetch fields for the selected collection
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/fields/${db}/${collection}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.status === 401 || res.status === 403) {
        navigate("/login");
        return;
      }
      if (res.ok) {
        const fields = await res.json();
        setCollectionFields(fields);
      } else {
        setCollectionFields([]);
      }
    } catch (err) {
      console.error("Failed to fetch fields:", err);
      setCollectionFields([]);
    }
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
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          query,
          dbName: selectedCollection.db
        }),
      });

      if (res.status === 401 || res.status === 403) {
        navigate("/login");
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Query execution failed");
      }

      setResults(Array.isArray(data) ? data : [data]);
      const endTime = performance.now();
      const duration = `${Math.round(endTime - startTime)}ms`;
      setExecutionTime(duration);
      addToHistory(query, duration);
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
                  fields={collectionFields}
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
            <QueryHistory
              history={history}
              onSelectQuery={handleSelectFromHistory}
              onClearHistory={clearHistory}
            />
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
              <Label htmlFor="environment">Environment</Label>
              <select
                id="environment"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedEnvironment}
                onChange={(e) => setSelectedEnvironment(e.target.value)}
              >
                {environments.map((env) => (
                  <option key={env} value={env}>
                    {env}
                  </option>
                ))}
              </select>
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
