export type Workspace = {
  id: string;
  name: string;
  plan: "Coastal" | "DeepSea" | "Global";
  ownerName: string;
};

export type ClientHealth = "strong" | "watch" | "needs-attention";

export type Client = {
  id: string;
  name: string;
  company: string;
  email: string;
  health: ClientHealth;
};

export type ProjectStatus = "on-track" | "at-risk" | "waiting" | "complete";

export type Project = {
  id: string;
  clientId: string;
  name: string;
  status: ProjectStatus;
  dueDate: string;
  budget: number;
  description: string;
};

export type ApprovalStatus = "pending" | "approved" | "changes";

export type Approval = {
  id: string;
  projectId: string;
  title: string;
  status: ApprovalStatus;
  requestedAt: string;
  notes: string;
};

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export type Invoice = {
  id: string;
  clientId: string;
  projectId: string;
  number: string;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
};

export type ActivityKind = "message" | "approval" | "invoice" | "file";

export type Activity = {
  id: string;
  kind: ActivityKind;
  text: string;
  at: string;
};

export type PortalData = {
  workspace: Workspace;
  clients: Client[];
  projects: Project[];
  approvals: Approval[];
  invoices: Invoice[];
  activity: Activity[];
};
