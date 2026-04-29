import { useState, useEffect } from 'react';
import { Sparkles, Loader2, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Project, Client } from '../types';

interface KoobiAIProps {
  projects: Project[];
  clients: Client[];
}

export function KoobiAI({ projects, clients }: KoobiAIProps) {
  const [insight, setInsight] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const generateInsight = async () => {
    const apiKey = (process.env as any).GEMINI_API_KEY || (process.env as any).VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      setInsight("AI mode is in standby. Configure your API key in settings to unlock strategic intelligence.");
      return;
    }

    setLoading(true);
    setError(false);
    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const payload = {
        projects: projects.map(p => ({
          name: p.name,
          status: p.status,
          deadline: p.dueDate,
          budget: p.budget,
          client: clients.find(c => c.id === p.clientId)?.company
        })),
        clients: clients.map(c => ({
          name: c.company,
          health: c.health
        }))
      };

      const prompt = `
        You are Koobi AI, a strategic analyst for a high-end creative agency.
        Based on this data: ${JSON.stringify(payload)}
        
        Provide a 1-2 sentence "Strategic Briefing" for the agency owner.
        Highlight the top priority (at-risk project or weak client health) and a specific action.
        Be professional, concise, and bold.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setInsight(response.text || "Stable workload detected. Monitor project milestones.");
    } catch (err) {
      console.error(err);
      setError(true);
      setInsight("Unable to sync AI intelligence. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateInsight();
  }, [projects.length]); // Regenerate when project count changes

  return (
    <section className="bg-gradient-to-br from-accent/90 to-accent-dark p-6 rounded-3xl shadow-xl shadow-accent/20 relative overflow-hidden group">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-white/10 transition-all duration-700" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gold/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
              <Sparkles className="text-white" size={16} />
            </div>
            <h3 className="text-white font-display font-bold tracking-tight">Koobi Strategic Intelligence</h3>
          </div>
          <button 
            onClick={generateInsight}
            disabled={loading}
            className="text-[10px] font-black text-white/60 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-1"
          >
            {loading ? <Loader2 size={10} className="animate-spin" /> : "Refresh Feed"}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 animate-pulse">
            <div className="h-4 w-full bg-white/20 rounded-lg" />
          </div>
        ) : error ? (
          <p className="text-white/80 text-xs font-medium leading-relaxed italic">
            {insight}
          </p>
        ) : (
          <div className="flex gap-4 items-start">
             <p className="text-white text-sm font-medium leading-relaxed flex-1">
               {insight}
             </p>
             <div className="hidden sm:flex gap-2">
                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/10 flex flex-col items-center">
                   <AlertCircle className="text-gold" size={14} />
                   <span className="text-[8px] font-black text-white/60 mt-1 uppercase">Risks</span>
                </div>
                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/10 flex flex-col items-center">
                   <TrendingUp className="text-green-400" size={14} />
                   <span className="text-[8px] font-black text-white/60 mt-1 uppercase">Grow</span>
                </div>
             </div>
          </div>
        )}
      </div>
    </section>
  );
}
