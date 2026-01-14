import { useState, useCallback } from "react";
import { Header } from "@/components/Header";
import { DatabaseSidebar } from "@/components/DatabaseSidebar";
import { QueryEditor } from "@/components/QueryEditor";
import { ResultsPanel } from "@/components/ResultsPanel";
import { QueryHistory } from "@/components/QueryHistory";
import { StatusBar } from "@/components/StatusBar";
import { mockDocuments, type Document } from "@/data/mockData";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

const defaultQuery = `// Select a collection and write your query
// Examples:
db.users.find({})
db.products.find({ price: { $lt: 100 } })
db.orders.aggregate([
  { $match: { status: "delivered" } },
  { $group: { _id: "$userId", total: { $sum: "$total" } } }
])`;

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

  const handleSelectCollection = (db: string, collection: string) => {
    setSelectedCollection({ db, collection });
    setQuery(`db.${collection}.find({})`);
    
    // Auto-load collection data
    const key = `${db}.${collection}`;
    const docs = mockDocuments[key] || [];
    setResults(docs);
    setError(null);
    setExecutionTime("< 1ms");
  };

  const handleExecuteQuery = useCallback(() => {
    setIsExecuting(true);
    setError(null);

    // Simulate query execution
    setTimeout(() => {
      try {
        // Parse the query to determine collection
        const match = query.match(/db\.(\w+)\./);
        if (!match) {
          throw new Error("Invalid query format. Use db.collection.find() syntax.");
        }

        const collectionName = match[1];
        let foundDocs: Document[] = [];

        // Search in mock data
        for (const [key, docs] of Object.entries(mockDocuments)) {
          if (key.endsWith(`.${collectionName}`)) {
            foundDocs = docs;
            break;
          }
        }

        // Simulate filtering for specific queries
        if (query.includes("$lt: 100") && collectionName === "products") {
          foundDocs = foundDocs.filter((doc) => {
            const price = doc.price as number | undefined;
            return price !== undefined && price < 100;
          });
        }

        if (query.includes('status: "delivered"') && collectionName === "orders") {
          foundDocs = foundDocs.filter((doc) => doc.status === "delivered");
        }

        if (query.includes('email:')) {
          const emailMatch = query.match(/email:\s*["']([^"']+)["']/);
          if (emailMatch) {
            foundDocs = foundDocs.filter((doc) => doc.email === emailMatch[1]);
          }
        }

        setResults(foundDocs);
        setExecutionTime(`${Math.floor(Math.random() * 30 + 10)}ms`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Query execution failed");
        setResults([]);
      } finally {
        setIsExecuting(false);
      }
    }, 300);
  }, [query]);

  const handleSelectFromHistory = (historyQuery: string) => {
    setQuery(historyQuery);
  };

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
    </div>
  );
};

export default Index;
