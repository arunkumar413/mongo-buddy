import { useState } from "react";
import { 
  ChevronRight, 
  ChevronDown, 
  Database, 
  FolderOpen, 
  FileJson,
  Search,
  RefreshCw,
  Plus
} from "lucide-react";
import { mockDatabases, type Database as DBType, type Collection } from "@/data/mockData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DatabaseSidebarProps {
  onSelectCollection: (db: string, collection: string) => void;
  selectedCollection: { db: string; collection: string } | null;
}

export function DatabaseSidebar({ onSelectCollection, selectedCollection }: DatabaseSidebarProps) {
  const [expandedDbs, setExpandedDbs] = useState<Set<string>>(new Set(["ecommerce"]));
  const [searchTerm, setSearchTerm] = useState("");

  const toggleDb = (dbName: string) => {
    const newExpanded = new Set(expandedDbs);
    if (newExpanded.has(dbName)) {
      newExpanded.delete(dbName);
    } else {
      newExpanded.add(dbName);
    }
    setExpandedDbs(newExpanded);
  };

  const filteredDatabases = mockDatabases.filter(db => 
    db.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    db.collections.some(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="h-full flex flex-col bg-sidebar">
      {/* Header */}
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Connections</span>
        </div>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>New Connection</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Search */}
      <div className="p-2 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Filter..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-7 pl-7 text-xs bg-input border-border"
          />
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto scrollbar-thin py-2">
        {/* Connection */}
        <div className="px-2 mb-2">
          <div className="tree-item text-primary">
            <Database className="h-4 w-4" />
            <span className="text-xs font-medium">localhost:27017</span>
          </div>
        </div>

        {/* Databases */}
        {filteredDatabases.map((db) => (
          <DatabaseTreeItem
            key={db.name}
            database={db}
            isExpanded={expandedDbs.has(db.name)}
            onToggle={() => toggleDb(db.name)}
            onSelectCollection={onSelectCollection}
            selectedCollection={selectedCollection}
            searchTerm={searchTerm}
          />
        ))}
      </div>

      {/* Footer Stats */}
      <div className="border-t border-border p-2">
        <div className="text-xs text-muted-foreground">
          <span className="text-primary font-medium">{mockDatabases.length}</span> databases, 
          <span className="text-primary font-medium ml-1">
            {mockDatabases.reduce((sum, db) => sum + db.collections.length, 0)}
          </span> collections
        </div>
      </div>
    </div>
  );
}

interface DatabaseTreeItemProps {
  database: DBType;
  isExpanded: boolean;
  onToggle: () => void;
  onSelectCollection: (db: string, collection: string) => void;
  selectedCollection: { db: string; collection: string } | null;
  searchTerm: string;
}

function DatabaseTreeItem({
  database,
  isExpanded,
  onToggle,
  onSelectCollection,
  selectedCollection,
  searchTerm,
}: DatabaseTreeItemProps) {
  const filteredCollections = database.collections.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="px-1">
      <button
        onClick={onToggle}
        className="tree-item w-full text-left"
      >
        {isExpanded ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        )}
        <FolderOpen className="h-4 w-4 text-warning" />
        <span className="text-xs font-medium">{database.name}</span>
        <span className="ml-auto text-[10px] text-muted-foreground">
          {database.collections.length}
        </span>
      </button>

      {isExpanded && (
        <div className="ml-4 animate-fade-in">
          {filteredCollections.map((collection) => (
            <CollectionTreeItem
              key={collection.name}
              collection={collection}
              dbName={database.name}
              isSelected={
                selectedCollection?.db === database.name &&
                selectedCollection?.collection === collection.name
              }
              onSelect={() => onSelectCollection(database.name, collection.name)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CollectionTreeItemProps {
  collection: Collection;
  dbName: string;
  isSelected: boolean;
  onSelect: () => void;
}

function CollectionTreeItem({ collection, isSelected, onSelect }: CollectionTreeItemProps) {
  return (
    <button
      onClick={onSelect}
      className={`tree-item w-full text-left ${isSelected ? "active" : ""}`}
    >
      <FileJson className="h-3.5 w-3.5 text-info" />
      <span className="text-xs">{collection.name}</span>
      <span className="ml-auto text-[10px] text-muted-foreground">
        {collection.documentCount.toLocaleString()}
      </span>
    </button>
  );
}
