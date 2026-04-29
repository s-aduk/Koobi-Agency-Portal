import { Fish, Users, Briefcase, CheckCircle2, FileText, Activity as ActivityIcon } from 'lucide-react';

type View = 'dashboard' | 'clients' | 'projects' | 'approvals' | 'invoices' | 'activity';

interface MobileNavProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

export function MobileNav({ currentView, setCurrentView }: MobileNavProps) {
  const NavItem = ({ view, icon: Icon, label }: { view: View, icon: any, label: string }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex flex-col items-center gap-1 px-4 py-2 min-w-[80px] transition-all relative ${
        currentView === view ? 'text-accent' : 'text-muted'
      }`}
    >
      <Icon size={18} />
      <span className="text-[10px] font-bold uppercase tracking-tighter whitespace-nowrap">{label}</span>
      {currentView === view && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-t-full" />
      )}
    </button>
  );

  return (
    <nav className="xl:hidden bg-surface border-b border-line overflow-x-auto flex items-center no-scrollbar sticky top-[65px] md:top-[81px] z-20">
      <NavItem view="dashboard" icon={Fish} label="Pulse" />
      <NavItem view="clients" icon={Users} label="Accounts" />
      <NavItem view="projects" icon={Briefcase} label="Pipeline" />
      <NavItem view="approvals" icon={CheckCircle2} label="Reviews" />
      <NavItem view="invoices" icon={FileText} label="Finance" />
      <NavItem view="activity" icon={ActivityIcon} label="Logs" />
    </nav>
  );
}
