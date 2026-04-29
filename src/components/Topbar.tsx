import { Search, Plus, Moon, Sun, Menu } from 'lucide-react';

interface TopbarProps {
  currentView: string;
  workspaceName: string;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onInitiateProject: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function Topbar({ 
  currentView, 
  workspaceName, 
  isDarkMode, 
  onToggleDarkMode, 
  onInitiateProject,
  searchQuery,
  setSearchQuery
}: TopbarProps) {
  return (
    <header className="flex-shrink-0 bg-background/80 backdrop-blur-md px-6 md:px-8 py-4 md:py-6 flex items-center justify-between border-b border-line sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight capitalize">{currentView}</h1>
        <span className="h-4 w-px bg-line hidden sm:block" />
        <p className="text-xs text-muted font-medium hidden sm:block">{workspaceName}</p>
      </div>
      
      <div className="flex items-center gap-3 md:gap-4">
        <div className="relative group hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
          <input 
            type="text" 
            placeholder="Lookup records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-1.5 bg-surface border border-line rounded-lg text-xs w-48 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-muted/60"
          />
        </div>

        <button 
          onClick={onToggleDarkMode}
          className="p-2 rounded-lg border border-line text-muted hover:bg-background transition-all"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button 
          onClick={onInitiateProject}
          className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:bg-accent-dark transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus size={16} /> <span className="hidden sm:inline">Initiate Project</span><span className="sm:hidden">New</span>
        </button>
      </div>
    </header>
  );
}
