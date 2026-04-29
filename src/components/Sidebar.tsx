import { LayoutDashboard, Users, Briefcase, CheckCircle2, FileText, Activity as ActivityIcon, Target, Fish } from 'lucide-react';

type View = 'dashboard' | 'clients' | 'projects' | 'approvals' | 'invoices' | 'activity';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  workspaceName: string;
  ownerName: string;
  plan: string;
}

export function Sidebar({ currentView, setCurrentView, ownerName, plan }: SidebarProps) {
  const NavItem = ({ view, icon: Icon, label }: { view: View, icon: any, label: string }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all group ${
        currentView === view 
          ? 'bg-accent text-white shadow-lg shadow-accent/20' 
          : 'text-muted hover:text-ink hover:bg-background'
      }`}
    >
      <Icon size={16} className={currentView === view ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
      <span className="truncate">{label}</span>
    </button>
  );

  return (
    <aside className="w-64 flex-shrink-0 border-r border-line bg-surface p-6 hidden xl:flex flex-col h-full sticky top-0 transition-colors duration-300">
      <div className="mb-10 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center shadow-lg shadow-accent/20 text-white transform rotate-3">
          <Fish size={22} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-display font-extrabold tracking-tight text-ink">Koobi</span>
          <span className="text-[9px] font-black text-accent uppercase tracking-[0.3em] -mt-1 opacity-80">Agency Portal</span>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1">
        <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-4 ml-3">Operations</p>
        <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
        <NavItem view="clients" icon={Users} label="Account Management" />
        <NavItem view="projects" icon={Briefcase} label="Project Pipeline" />
        <NavItem view="approvals" icon={CheckCircle2} label="Pending Reviews" />
        <NavItem view="invoices" icon={FileText} label="Financial Reports" />
        <NavItem view="activity" icon={ActivityIcon} label="System logs" />
      </nav>

      <div className="mt-auto border-t border-line pt-6">
        <div className="flex items-center gap-3 p-2 bg-background rounded-xl border border-line">
          <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-bold border border-accent/20 text-accent">
            {ownerName.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-semibold truncate">{ownerName}</div>
            <div className="text-[10px] text-muted capitalize flex items-center gap-1">
              <Target size={8} /> {plan} Plan
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
