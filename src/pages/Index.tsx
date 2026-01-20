import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { DatabaseSidebar, type DatabaseType } from "@/components/DatabaseSidebar";
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
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

const defaultQuery = `// Select a collection and write your query
// Examples:
db.users.find({})
db.products.find({ price: { $lt: 100 } })`;

const API_URL = "http://localhost:3001/api";

interface Tab {
  id: string;
  name: string;
  query: string;
  results: Document[];
  error: string | null;
  isExecuting: boolean;
  executionTime: string | null;
}

const getCollectionFromQuery = (query: string): string | null => {
  const match = query.match(/db\.([a-zA-Z0-9_]+)\./);
  return match ? match[1] : null;
};

const Index = () => {
  const navigate = useNavigate();
  const [selectedCollection, setSelectedCollection] = useState<{
    db: string;
    collection: string;
  } | null>(null);

  // Tabs state
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: "1",
      name: "Query 1",
      query: defaultQuery,
      results: [],
      error: null,
      isExecuting: false,
      executionTime: null,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState("1");

  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState(true);
  const [environments, setEnvironments] = useState<string[]>([]);
  const [selectedEnvironment, setSelectedEnvironment] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [databases, setDatabases] = useState<DatabaseType[]>([]);
  const [collectionFields, setCollectionFields] = useState<string[]>([]);

  // History state
  const [history, setHistory] = useState<HistoryItemType[]>(() => {
    const saved = localStorage.getItem("queryHistory");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("queryHistory", JSON.stringify(history));
  }, [history]);

  const fetchEnvironments = useCallback(async () => {
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
  }, [navigate]);

  useEffect(() => {
    fetchEnvironments();
  }, [fetchEnvironments]);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const derivedCollection = getCollectionFromQuery(activeTab.query);
  const displayCollection = derivedCollection || selectedCollection?.collection || null;

  const updateActiveTab = useCallback((updates: Partial<Tab>) => {
    setTabs((prev) =>
      prev.map((tab) => (tab.id === activeTabId ? { ...tab, ...updates } : tab))
    );
  }, [activeTabId]);

  const handleAddTab = useCallback(() => {
    const newId = Date.now().toString();
    const newTab: Tab = {
      id: newId,
      name: `Query ${tabs.length + 1}`,
      query: defaultQuery,
      results: [],
      error: null,
      isExecuting: false,
      executionTime: null,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
  }, [tabs.length]);

  const handleCloseTab = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (tabs.length === 1) return;

    const newTabs = tabs.filter((t) => t.id !== id);
    setTabs(newTabs);

    if (activeTabId === id) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
  }, [tabs, activeTabId]);

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

  const fetchDatabases = useCallback(async () => {
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
  }, [navigate]);

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

  const handleSelectCollection = useCallback(async (db: string, collection: string) => {
    setSelectedCollection({ db, collection });

    // Update active tab with new query template
    setTabs(prev => prev.map(tab => {
      if (tab.id === activeTabId) {
        return {
          ...tab,
          query: `db.${collection}.find({})`,
          results: [],
          error: null,
          executionTime: null
        };
      }
      return tab;
    }));

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
  }, [activeTabId, navigate]);

  const handleExecuteQuery = useCallback(async () => {
    if (!selectedCollection) {
      toast.error("Please select a collection first");
      return;
    }

    updateActiveTab({ isExecuting: true, error: null });
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
          query: activeTab.query,
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

      const endTime = performance.now();
      const duration = `${Math.round(endTime - startTime)}ms`;

      updateActiveTab({
        results: Array.isArray(data) ? data : [data],
        executionTime: duration,
        isExecuting: false
      });

      addToHistory(activeTab.query, duration);
    } catch (err) {
      updateActiveTab({
        error: err instanceof Error ? err.message : "Query execution failed",
        results: [],
        isExecuting: false
      });
    }
  }, [activeTab.query, selectedCollection, updateActiveTab, addToHistory, navigate]);

  const handleSelectFromHistory = useCallback((historyQuery: string) => {
    updateActiveTab({ query: historyQuery });
  }, [updateActiveTab]);

  const handleRefreshDatabases = useCallback(() => {
    fetchDatabases();
  }, [fetchDatabases]);

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
            <div className="h-full flex flex-col">
              {/* Tabs Bar */}
              <div className="flex items-center border-b bg-muted/40 px-1 pt-1 gap-1 overflow-x-auto scrollbar-none">
                {tabs.map((tab) => (
                  <div
                    key={tab.id}
                    className={cn(
                      "group flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-t-md cursor-pointer border-t border-x border-transparent select-none min-w-[100px] max-w-[200px]",
                      activeTabId === tab.id
                        ? "bg-background border-border text-foreground"
                        : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => setActiveTabId(tab.id)}
                  >
                    <span className="truncate flex-1">{tab.name}</span>
                    {tabs.length > 1 && (
                      <button
                        onClick={(e) => handleCloseTab(e, tab.id)}
                        className="opacity-0 group-hover:opacity-100 hover:bg-muted-foreground/20 rounded p-0.5 transition-all"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={handleAddTab}
                  className="p-1.5 hover:bg-muted/60 rounded-md text-muted-foreground hover:text-foreground transition-colors ml-1"
                  title="New Tab"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <ResizablePanelGroup direction="vertical">
                {/* Query Editor */}
                <ResizablePanel defaultSize={40} minSize={20}>
                  <QueryEditor
                    query={activeTab.query}
                    onQueryChange={(q) => updateActiveTab({ query: q })}
                    onExecute={handleExecuteQuery}
                    isExecuting={activeTab.isExecuting}
                    executionTime={activeTab.executionTime}
                    activeCollection={displayCollection}
                    fields={collectionFields}
                  />
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Results Panel */}
                <ResizablePanel defaultSize={60} minSize={30}>
                  <ResultsPanel results={activeTab.results} error={activeTab.error} />
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
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
        documentCount={activeTab.results.length}
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
