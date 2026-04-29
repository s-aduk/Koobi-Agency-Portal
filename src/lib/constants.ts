import { PortalData } from '../types.ts';

export const seedData: PortalData = {
  workspace: {
    id: "ws_1",
    name: "Koobi Creative Hub",
    plan: "Global",
    ownerName: "Akosua Mensah"
  },
  clients: [
    { id: "c_1", name: "Kojo Arhin", company: "Zaria Tech", email: "kojo@zariatech.io", health: "strong" },
    { id: "c_2", name: "Efua Boateng", company: "Lumina Retail", email: "efua@luminoretail.com", health: "watch" },
    { id: "c_3", name: "Yaw Owusu", company: "Green Frontier", email: "yaw@greenfrontier.org", health: "needs-attention" }
  ],
  projects: [
    { id: "p_1", clientId: "c_1", name: "E-commerce Redesign", status: "on-track", dueDate: "2026-05-15", budget: 12000, description: "Full UX/UI overhaul for the core retail platform." },
    { id: "p_2", clientId: "c_2", name: "Brand Identity System", status: "waiting", dueDate: "2026-06-01", budget: 8500, description: "New logo, palette, and brand guidelines for Q3 launch." },
    { id: "p_3", clientId: "c_3", name: "Mobile App Strategy", status: "at-risk", dueDate: "2026-05-05", budget: 5000, description: "User research and prototyping for the upcoming mobile expansion." }
  ],
  approvals: [
    { id: "a_1", projectId: "p_1", title: "Onboarding Wireframes", status: "pending", requestedAt: "2026-04-28T10:00:00Z", notes: "Please review the new flow for KYB verification." },
    { id: "a_2", projectId: "p_2", title: "Final Logo Variants", status: "approved", requestedAt: "2026-04-25T14:30:00Z", notes: "Finalizing the horizontal and vertical lockups." }
  ],
  invoices: [
    { id: "i_1", clientId: "c_1", projectId: "p_1", number: "INV-2026-001", amount: 6000, dueDate: "2026-05-01", status: "sent" },
    { id: "i_2", clientId: "c_3", projectId: "p_3", number: "INV-2026-002", amount: 2500, dueDate: "2026-04-20", status: "overdue" }
  ],
  activity: [
    { id: "act_1", kind: "approval", text: "Akosua Mensah requested approval for 'Onboarding Wireframes'", at: "2026-04-28T10:00:00Z" },
    { id: "act_2", kind: "invoice", text: "Invoice INV-2026-001 sent to Kojo Arhin", at: "2026-04-27T09:15:00Z" },
    { id: "act_3", kind: "message", text: "New comment on 'Lumina Brand Identity'", at: "2026-04-26T16:45:00Z" }
  ]
};
