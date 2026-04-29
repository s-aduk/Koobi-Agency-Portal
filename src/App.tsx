import { useState, useEffect, useMemo, FormEvent } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  CheckCircle2, 
  FileText, 
  Activity as ActivityIcon,
  Plus,
  Search,
  Bell,
  Clock,
  ChevronRight,
  Filter,
  MoreVertical,
  AlertCircle,
  FileDown,
  X,
  CreditCard,
  Target,
  ArrowUpRight,
  TrendingUp,
  Download,
  Fish
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PortalData, Project, ProjectStatus, Approval, Invoice, Activity } from './types.ts';

// Helper for currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { MobileNav } from './components/MobileNav';
import { KoobiAI } from './components/KoobiAI';

type View = 'dashboard' | 'clients' | 'projects' | 'approvals' | 'invoices' | 'activity';

import { seedData } from './lib/constants.ts';

export default function App() {
  const [data, setData] = useState<PortalData | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newProject, setNewProject] = useState({
    name: '',
    clientId: '',
    status: 'on-track' as ProjectStatus,
    dueDate: '',
    budget: 0,
    description: ''
  });

  const fetchData = async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error('API Unavailable');
      const json = await res.json();
      setData(json);
      localStorage.setItem('koobi_data', JSON.stringify(json));
    } catch (err) {
      console.warn("API check failed, checking local cache...");
      const cached = localStorage.getItem('koobi_data');
      if (cached) {
        setData(JSON.parse(cached));
      } else {
        setData(seedData);
      }
      setError(""); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const stats = useMemo(() => {
    if (!data) return [];
    const pipeline = data.invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const pendingApprovals = data.approvals.filter(a => a.status === 'pending').length;
    const overdueInvoices = data.invoices.filter(i => i.status === 'overdue').length;
    const activeProjects = data.projects.filter(p => p.status !== 'complete').length;

    return [
      { label: 'Project Pipeline', value: formatCurrency(pipeline), icon: Briefcase, color: 'text-accent', trend: '+12.5%' },
      { label: 'Pending Approvals', value: pendingApprovals, icon: CheckCircle2, color: 'text-gold', trend: 'Urgent' },
      { label: 'Overdue Invoices', value: overdueInvoices, icon: AlertCircle, color: 'text-red', trend: 'Check status' },
      { label: 'Active Projects', value: activeProjects, icon: Briefcase, color: 'text-accent', trend: 'On track' },
    ];
  }, [data]);

  const chartData = useMemo(() => {
    if (!data) return [];
    // Mocking a trend based on invoices and projects
    return [
      { name: 'Jan', value: 4000 },
      { name: 'Feb', value: 3000 },
      { name: 'Mar', value: 5000 },
      { name: 'Apr', value: data.invoices.reduce((s, i) => s + i.amount, 0) / 2 },
      { name: 'May', value: data.invoices.reduce((s, i) => s + i.amount, 0) },
      { name: 'Jun', value: data.projects.reduce((s, p) => s + p.budget, 0) / 3 },
    ];
  }, [data]);

  const handleCreateProject = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject)
      });
      if (!res.ok) throw new Error('Failed to create project');
      await fetchData();
      setIsCreating(false);
      setNewProject({
        name: '',
        clientId: '',
        status: 'on-track',
        dueDate: '',
        budget: 0,
        description: ''
      });
    } catch (err) {
      setError("Failed to create project.");
    }
  };

  const handleUpdateApproval = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/approvals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update approval');
      await fetchData();
    } catch (err) {
      setError("Failed to update approval status.");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-background text-ink">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center">
           <Fish className="text-accent animate-bounce" />
        </div>
        <p className="text-muted text-sm font-display font-semibold tracking-tight">Synchronizing Koobi Portal...</p>
      </div>
    </div>
  );

  if (!data) return <div className="p-12 text-center text-red font-bold bg-background min-h-screen">{error || "Critical system failure: Data sync failed."}</div>;

  return (
    <div className="flex h-screen overflow-hidden bg-background text-ink selection:bg-accent/20 selection:text-accent font-sans transition-colors duration-300">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        workspaceName={data.workspace.name}
        ownerName={data.workspace.ownerName}
        plan={data.workspace.plan}
      />

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        <Topbar 
          currentView={currentView} 
          workspaceName={data.workspace.name} 
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          onInitiateProject={() => setIsCreating(true)} 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <MobileNav 
          currentView={currentView} 
          setCurrentView={setCurrentView} 
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
          <div className="max-w-7xl mx-auto w-full">
            <AnimatePresence mode="wait">
              {currentView === 'dashboard' && (
                <motion.div 
                  key="dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  {/* Stats */}
                  <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, i) => (
                      <div key={stat.label} className="bg-surface border border-line p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-[10px] font-black text-muted uppercase tracking-[0.1em]">{stat.label}</p>
                          <div className={`p-2 rounded-lg bg-background ${stat.color}`}>
                            <stat.icon size={16} />
                          </div>
                        </div>
                        <div className="flex items-end gap-2 text-ink">
                          <h3 className="text-2xl font-bold tracking-tight">{stat.value}</h3>
                          <span className="text-[9px] font-bold text-accent mb-1 bg-accent/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <TrendingUp size={8} /> {stat.trend}
                          </span>
                        </div>
                      </div>
                    ))}
                  </section>

                  {/* Koobi AI Intelligence */}
                  {data && <KoobiAI projects={data.projects} clients={data.clients} />}

                  {/* Main Dashboard Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                      {/* Analytics Chart */}
                      <section className="bg-surface border border-line rounded-2xl p-6 shadow-sm overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                          <div>
                            <h3 className="text-lg font-bold text-ink">Revenue Projections</h3>
                            <p className="text-xs text-muted font-medium">Tracking fiscal performance across the current quarter.</p>
                          </div>
                          <div className="flex gap-2">
                            <button className="p-2 border border-line rounded-lg text-muted hover:text-ink hover:bg-background transition-all"><Download size={16} /></button>
                            <button className="p-2 border border-line rounded-lg text-muted hover:text-ink hover:bg-background transition-all"><MoreVertical size={16} /></button>
                          </div>
                        </div>
                        
                        <div className="h-[300px] w-full min-h-[300px]">
                          <ResponsiveContainer width="99%" height="100%" minWidth={0}>
                            <AreaChart data={chartData}>
                              <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.1}/>
                                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                              <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fontSize: 10, fontWeight: 600, fill: isDarkMode ? '#94a3b8' : '#64748b'}} 
                                dy={10}
                              />
                              <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fontSize: 10, fontWeight: 600, fill: isDarkMode ? '#94a3b8' : '#64748b'}}
                                tickFormatter={(val) => `$${val/1000}k`}
                              />
                              <Tooltip 
                                contentStyle={{ 
                                  borderRadius: '12px', 
                                  border: isDarkMode ? '1px solid #1e293b' : '1px solid #e2e8f0', 
                                  backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                                }}
                                itemStyle={{ color: 'var(--accent)', fontWeight: 700, fontSize: '12px' }}
                              />
                              <Area type="monotone" dataKey="value" stroke="var(--accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </section>

                      {/* Active Projects Table-ish */}
                      <section className="bg-surface border border-line rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-line flex items-center justify-between bg-background/50">
                          <h3 className="text-lg font-bold text-ink">Priority Objectives</h3>
                          <div className="flex gap-2">
                             <button onClick={() => setCurrentView('projects')} className="text-[10px] font-bold text-muted hover:text-accent flex items-center gap-1 px-2 py-1 rounded bg-surface border border-line transition-all">
                                View Pipeline <ChevronRight size={12} />
                             </button>
                          </div>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead className="bg-background/50">
                              <tr>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-muted tracking-widest">Project</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-muted tracking-widest">Account</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-muted tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-muted tracking-widest text-right">Budget</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-line">
                              {data.projects.slice(0, 5).map((project) => (
                                <tr 
                                  key={project.id} 
                                  onClick={() => setSelectedProject(project)}
                                  className="hover:bg-background/50 transition-colors group cursor-pointer"
                                >
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col">
                                      <span className="text-sm font-bold group-hover:text-accent transition-colors">{project.name}</span>
                                      <span className="text-[10px] text-muted flex items-center gap-1"><Clock size={10} /> {new Date(project.dueDate).toLocaleDateString()}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-muted">
                                    {data.clients.find(c => c.id === project.clientId)?.company}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      project.status === 'on-track' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' :
                                      project.status === 'waiting' ? 'bg-gold/10 text-gold-dark' :
                                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400'
                                    }`}>
                                      {project.status.replace('-', ' ').toUpperCase()}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-mono font-bold">
                                    {formatCurrency(project.budget)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </section>
                    </div>

                    {/* Sidebar Analytics */}
                    <aside className="space-y-8">
                      {/* Approvals */}
                      <section className="bg-surface border border-line rounded-2xl shadow-sm overflow-hidden flex flex-col">
                        <div className="p-5 border-b border-line bg-background/50 flex items-center justify-between">
                          <h3 className="text-sm font-bold text-ink">Review Pipeline</h3>
                          <div className="w-5 h-5 rounded-full bg-gold text-white text-[10px] flex items-center justify-center font-black">
                            {data.approvals.filter(a => a.status === 'pending').length}
                          </div>
                        </div>
                        <div className="divide-y divide-line">
                          {data.approvals.filter(a => a.status === 'pending').map((approval) => (
                            <div key={approval.id} className="p-5 hover:bg-background transition-colors">
                              <div className="flex justify-between items-start mb-3">
                                <div className="max-w-[70%]">
                                  <h4 className="text-xs font-bold truncate leading-tight mb-1">{approval.title}</h4>
                                  <p className="text-[10px] text-muted truncate">{data.projects.find(p => p.id === approval.projectId)?.name}</p>
                                </div>
                                <span className="text-[9px] font-black bg-gold/10 text-gold px-1.5 py-0.5 rounded-md uppercase">Pending</span>
                              </div>
                              <div className="flex gap-2">
                                 <button 
                                   onClick={() => handleUpdateApproval(approval.id, 'approved')}
                                   className="flex-1 bg-ink text-white text-[10px] font-bold py-1.5 rounded-lg hover:bg-black transition-all flex items-center justify-center gap-1.5"
                                 >
                                   <CheckCircle2 size={12} /> Approve
                                 </button>
                                 <button 
                                   className="px-3 border border-line text-muted text-[10px] font-bold py-1.5 rounded-lg hover:bg-surface transition-all"
                                 >
                                   Verify
                                 </button>
                              </div>
                            </div>
                          ))}
                          {data.approvals.filter(a => a.status === 'pending').length === 0 && (
                            <div className="p-8 text-center text-muted text-xs font-medium italic opacity-60">
                              System is clear. All reviews complete.
                            </div>
                          )}
                        </div>
                      </section>

                      {/* Global Activity Feed */}
                      <section className="bg-surface border border-line rounded-2xl shadow-sm flex flex-col">
                        <div className="p-5 border-b border-line bg-background/50 flex items-center justify-between text-xs font-bold text-ink">
                          <span>Event Stream</span>
                          <div className="flex items-center gap-1.5">
                             <div className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
                             <span className="text-[10px] text-accent uppercase font-black tracking-widest">Live</span>
                          </div>
                        </div>
                        <div className="p-6 space-y-6">
                          {data.activity.slice(0, 5).map((log) => (
                            <div key={log.id} className="flex gap-4 relative group">
                              <div className={`mt-1 h-3 w-3 rounded-full border-2 border-white shadow-sm flex-shrink-0 ${
                                log.kind === 'invoice' ? 'bg-accent' : log.kind === 'approval' ? 'bg-gold' : 'bg-gold-dark'
                              }`} />
                              <div className="flex-1 min-w-0">
                                 <p className="text-[11px] leading-tight font-medium text-ink/80">{log.text}</p>
                                 <time className="text-[9px] text-muted font-bold uppercase tracking-tighter mt-1 block">
                                   {new Date(log.at).toLocaleDateString()} at {new Date(log.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                 </time>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button 
                          onClick={() => setCurrentView('activity')}
                          className="p-3 text-[10px] font-black text-muted uppercase tracking-widest border-t border-line hover:text-accent transition-all bg-background/20"
                        >
                          Access Activity Logs
                        </button>
                      </section>
                    </aside>
                  </div>
                </motion.div>
              )}

              {currentView === 'invoices' && (
                <motion.div 
                  key="invoices"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-8"
                >
                  <div className="bg-surface border border-line rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-8 border-b border-line bg-background/50 flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-bold">Invoicing Infrastructure</h2>
                        <p className="text-xs text-muted font-medium mt-1">Full ledger of all digital transactions and pending transfers.</p>
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2 bg-background border border-line rounded-xl text-sm font-bold hover:bg-surface transition-all">
                        <Download size={16} /> Export Ledger
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-background/50 border-b border-line">
                          <tr>
                            <th className="px-8 py-5 text-[10px] font-black text-muted uppercase tracking-widest">Invoice Unit</th>
                            <th className="px-8 py-5 text-[10px] font-black text-muted uppercase tracking-widest">Beneficiary</th>
                            <th className="px-8 py-5 text-[10px] font-black text-muted uppercase tracking-widest">Validation Status</th>
                            <th className="px-8 py-5 text-[10px] font-black text-muted uppercase tracking-widest">Amount Due</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                          {data.invoices.map((inv) => (
                            <tr key={inv.id} className="hover:bg-background/20 transition-colors">
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-background rounded-lg text-muted"><FileText size={16} /></div>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-bold">{inv.number}</span>
                                    <span className="text-[10px] text-muted font-bold uppercase">{new Date(inv.dueDate).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-6 text-sm font-semibold text-muted">
                                {data.clients.find(c => c.id === inv.clientId)?.company || 'N/A'}
                              </td>
                              <td className="px-8 py-6">
                                <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase ${
                                  inv.status === 'paid' ? 'bg-green-100 text-green-700' :
                                  inv.status === 'overdue' ? 'bg-red-100 text-red' :
                                  'bg-gold/10 text-gold-dark'
                                }`}>
                                  {inv.status}
                                </span>
                              </td>
                              <td className="px-8 py-6 text-sm font-mono font-bold">{formatCurrency(inv.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentView === 'invoices' && (
                <motion.div 
                  key="invoices"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-8"
                >
                  <div className="bg-surface border border-line rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-8 border-b border-line bg-background/50 flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-bold">Invoicing Ledger</h2>
                        <p className="text-xs text-muted font-medium mt-1">Detailed record of all digital transactions and financial transfers.</p>
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2 bg-background border border-line rounded-xl text-sm font-bold hover:bg-surface transition-all">
                        <Download size={16} /> Export Ledger
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-background/50 border-b border-line">
                          <tr>
                            <th className="px-8 py-5 text-[10px] font-black text-muted uppercase tracking-widest">Invoice Unit</th>
                            <th className="px-8 py-5 text-[10px] font-black text-muted uppercase tracking-widest">Beneficiary</th>
                            <th className="px-8 py-5 text-[10px] font-black text-muted uppercase tracking-widest">Validation Status</th>
                            <th className="px-8 py-5 text-[10px] font-black text-muted uppercase tracking-widest">Amount Due</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                          {data.invoices
                            .filter(inv => 
                              inv.number.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              data.clients.find(c => c.id === inv.clientId)?.company.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map((inv) => (
                            <tr key={inv.id} className="hover:bg-background/20 transition-colors">
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-background rounded-lg text-muted"><FileText size={16} /></div>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-bold">{inv.number}</span>
                                    <span className="text-[10px] text-muted font-bold uppercase">{new Date(inv.dueDate).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-6 text-sm font-semibold text-muted">
                                {data.clients.find(c => c.id === inv.clientId)?.company || 'N/A'}
                              </td>
                              <td className="px-8 py-6">
                                <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase ${
                                  inv.status === 'paid' ? 'bg-green-100 text-green-700' :
                                  inv.status === 'overdue' ? 'bg-red-100 text-red' :
                                  'bg-gold/10 text-gold-dark'
                                }`}>
                                  {inv.status}
                                </span>
                              </td>
                              <td className="px-8 py-6 text-sm font-mono font-bold">{formatCurrency(inv.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentView === 'projects' && (
                <motion.div 
                  key="projects"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-8"
                >
                  <div className="bg-surface border border-line rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-8 border-b border-line bg-background/50 flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-bold">Project Pipeline</h2>
                        <p className="text-xs text-muted font-medium mt-1">Full overview of all active and pending agency initiatives.</p>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-background/50 border-b border-line">
                          <tr>
                            <th className="px-8 py-5 text-[10px] font-black text-muted uppercase tracking-widest">Project Name</th>
                            <th className="px-8 py-5 text-[10px] font-black text-muted uppercase tracking-widest">Account</th>
                            <th className="px-8 py-5 text-[10px] font-black text-muted uppercase tracking-widest">Status</th>
                            <th className="px-8 py-5 text-[10px] font-black text-muted uppercase tracking-widest">Deadline</th>
                            <th className="px-8 py-5 text-[10px] font-black text-muted uppercase tracking-widest text-right">Allocation</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                          {data.projects
                            .filter(p => 
                              p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              data.clients.find(c => c.id === p.clientId)?.company.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map((project) => (
                            <tr 
                              key={project.id} 
                              onClick={() => setSelectedProject(project)}
                              className="hover:bg-background/20 transition-colors cursor-pointer group"
                            >
                              <td className="px-8 py-6">
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold">{project.name}</span>
                                  <span className="text-[10px] text-muted line-clamp-1 max-w-[250px]">{project.description}</span>
                                </div>
                              </td>
                              <td className="px-8 py-6 text-sm font-semibold text-muted">
                                {data.clients.find(c => c.id === project.clientId)?.company}
                              </td>
                              <td className="px-8 py-6">
                                <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase ${
                                  project.status === 'on-track' ? 'bg-green-100 text-green-700' :
                                  project.status === 'waiting' ? 'bg-gold/10 text-gold-dark' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {project.status}
                                </span>
                              </td>
                              <td className="px-8 py-6 text-xs font-bold text-muted">{new Date(project.dueDate).toLocaleDateString()}</td>
                              <td className="px-8 py-6 text-sm font-mono font-bold text-right">{formatCurrency(project.budget)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentView === 'clients' && (
                <motion.div 
                   key="clients"
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {data.clients
                    .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.company.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(client => (
                    <div key={client.id} className="bg-surface border border-line rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent font-bold text-xl">
                          {client.company[0]}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg group-hover:text-accent transition-colors">{client.company}</h3>
                          <p className="text-xs text-muted font-medium">{client.name}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-[10px] uppercase font-black text-muted tracking-widest">
                          <span>Health Index</span>
                          <span className={`${
                            client.health === 'strong' ? 'text-green-600' :
                            client.health === 'watch' ? 'text-gold' : 'text-red'
                          }`}>{client.health}</span>
                        </div>
                        <div className="h-1 w-full bg-background rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${
                            client.health === 'strong' ? 'w-full bg-green-500' :
                            client.health === 'watch' ? 'w-2/3 bg-gold' : 'w-1/3 bg-red'
                          }`} />
                        </div>
                        <div className="pt-4 flex items-center justify-between">
                           <div className="flex -space-x-2">
                             <div className="w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center text-[8px] border-2 border-surface font-bold">AK</div>
                             <div className="w-7 h-7 rounded-full bg-gold text-white flex items-center justify-center text-[8px] border-2 border-surface font-bold">MB</div>
                           </div>
                           <button className="text-[10px] font-bold text-accent hover:underline">View Dossier</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {['approvals', 'activity'].includes(currentView) && currentView !== 'dashboard' && currentView !== 'invoices' && (
                <motion.div 
                  key="placeholder"
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="min-h-[500px] flex flex-col items-center justify-center opacity-30 text-center"
                >
                  <div className="w-24 h-24 rounded-3xl bg-accent/20 mb-6 flex items-center justify-center">
                     <Target size={48} className="text-accent" />
                  </div>
                  <h2 className="text-xl font-bold uppercase tracking-widest italic mb-2">Interface Layer: {currentView}</h2>
                  <p className="max-w-md text-sm font-medium">Full module integration for '{currentView}' mapping is live, navigation enabled. Content population in progress.</p>
                  <button onClick={() => setCurrentView('dashboard')} className="mt-8 text-xs font-bold underline text-accent">Return to Core Dashboard</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* New Project Modal Overlay */}
      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreating(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-surface w-full max-w-lg rounded-3xl shadow-2xl border border-line p-8 flex flex-col mx-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight">Initiate New Project</h3>
                  <p className="text-xs text-muted font-medium mt-1">Define technical requirements and allocate operational resources.</p>
                </div>
                <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-muted/10 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black tracking-widest text-muted">Project ID/Reference</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Strategic Brand Architecture Refresh"
                    value={newProject.name}
                    onChange={e => setNewProject({...newProject, name: e.target.value})}
                    className="w-full px-4 py-3 bg-background border border-line rounded-xl text-sm focus:outline-none focus:border-accent transition-all font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black tracking-widest text-muted">Target Account</label>
                    <select 
                      required
                      value={newProject.clientId}
                      onChange={e => setNewProject({...newProject, clientId: e.target.value})}
                      className="w-full px-4 py-3 bg-background border border-line rounded-xl text-sm focus:outline-none focus:border-accent transition-all font-medium appearance-none"
                    >
                      <option value="">Select account...</option>
                      {data.clients.map(c => (
                        <option key={c.id} value={c.id}>{c.company}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black tracking-widest text-muted">Financial Allocation</label>
                    <input 
                      required
                      type="number" 
                      placeholder="$ Amount"
                      value={newProject.budget}
                      onChange={e => setNewProject({...newProject, budget: Number(e.target.value)})}
                      className="w-full px-4 py-3 bg-background border border-line rounded-xl text-sm focus:outline-none focus:border-accent transition-all font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black tracking-widest text-muted">Execution Deadline</label>
                    <input 
                      required
                      type="date" 
                      value={newProject.dueDate}
                      onChange={e => setNewProject({...newProject, dueDate: e.target.value})}
                      className="w-full px-4 py-3 bg-background border border-line rounded-xl text-sm focus:outline-none focus:border-accent transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black tracking-widest text-muted">Project State</label>
                    <select 
                      value={newProject.status}
                      onChange={e => setNewProject({...newProject, status: e.target.value as ProjectStatus})}
                      className="w-full px-4 py-3 bg-background border border-line rounded-xl text-sm focus:outline-none focus:border-accent transition-all font-medium appearance-none"
                    >
                      <option value="on-track">ON-TRACK</option>
                      <option value="waiting">WAITING</option>
                      <option value="at-risk">AT-RISK</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black tracking-widest text-muted">Scope Narrative</label>
                  <textarea 
                    placeholder="Milestones, deliverables, and technical constraints..."
                    rows={3}
                    value={newProject.description}
                    onChange={e => setNewProject({...newProject, description: e.target.value})}
                    className="w-full px-4 py-3 bg-background border border-line rounded-xl text-sm focus:outline-none focus:border-accent transition-all font-medium resize-none shadow-inner"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsCreating(false)}
                    className="flex-1 py-3 border border-line text-muted text-sm font-bold rounded-xl hover:bg-background transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] py-3 bg-accent text-white text-sm font-bold rounded-xl hover:bg-accent-dark shadow-lg shadow-accent/20 transition-all active:scale-[0.98]"
                  >
                    Deploy Infrastructure
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSelectedProject(null)}
               className="fixed inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="relative bg-surface w-full max-w-2xl h-[90vh] rounded-3xl shadow-2xl border border-line flex flex-col overflow-hidden"
            >
              <div className="p-8 border-b border-line bg-background/50 flex items-center justify-between">
                <div>
                   <h2 className="text-2xl font-bold text-ink">{selectedProject.name}</h2>
                   <p className="text-xs text-muted font-medium mt-1">Detailed Operational Analysis</p>
                </div>
                <button onClick={() => setSelectedProject(null)} className="p-2 hover:bg-muted/10 rounded-full">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="grid grid-cols-3 gap-4">
                   <div className="p-4 bg-background rounded-2xl border border-line">
                      <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Status</p>
                      <span className={`text-xs font-bold uppercase ${
                        selectedProject.status === 'on-track' ? 'text-green-600' : 'text-gold'
                      }`}>{selectedProject.status}</span>
                   </div>
                   <div className="p-4 bg-background rounded-2xl border border-line">
                      <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Financials</p>
                      <span className="text-xs font-bold">{formatCurrency(selectedProject.budget)}</span>
                   </div>
                   <div className="p-4 bg-background rounded-2xl border border-line">
                      <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Deadline</p>
                      <span className="text-xs font-bold">{new Date(selectedProject.dueDate).toLocaleDateString()}</span>
                   </div>
                </div>

                <section>
                   <h4 className="text-xs font-black text-muted uppercase tracking-[0.2em] mb-4">Milestone Roadmap</h4>
                   <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-4 p-4 border border-line rounded-2xl bg-surface hover:border-accent transition-all">
                           <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-[10px] font-bold border border-line">0{i}</div>
                           <div>
                              <p className="text-sm font-bold">Phase {i}: Technical Integration</p>
                              <p className="text-[10px] text-muted font-medium">Standard operational benchmark for mid-tier engagement.</p>
                           </div>
                           {i === 1 ? <CheckCircle2 className="ml-auto text-green-500" size={16} /> : <div className="ml-auto w-4 h-4 rounded-full border-2 border-line" />}
                        </div>
                      ))}
                   </div>
                </section>
              </div>
              <div className="p-6 border-t border-line bg-background/50 flex gap-4">
                <button className="flex-1 py-3 bg-accent text-white font-bold text-xs rounded-xl shadow-lg shadow-accent/20">Edit Parameters</button>
                <button className="flex-1 py-3 border border-line text-xs font-bold rounded-xl hover:bg-surface">Notify Account</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
