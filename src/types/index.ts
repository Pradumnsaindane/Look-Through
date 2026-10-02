export type NavigationTab = 
  | 'overview' 
  | 'today' 
  | 'customers' 
  | 'finance' 
  | 'work' 
  | 'analytics' 
  | 'ai' 
  | 'alerts' 
  | 'integrations' 
  | 'settings';

export type CustomerSubTab = 'customers' | 'leads' | 'deals' | 'activity';
export type FinanceSubTab = 'overview' | 'revenue' | 'cashflow' | 'invoices' | 'expenses' | 'receivables' | 'payables';
export type WorkSubTab = 'today' | 'upcoming' | 'overdue' | 'projects' | 'tasks' | 'team';
export type AnalyticsSubTab = 'performance' | 'sales' | 'financial' | 'customer';
export type AISubTab = 'insights' | 'recommendations' | 'briefings' | 'anomalies' | 'actions';

export type HealthStatus = 'healthy' | 'stable' | 'growing' | 'attention' | 'critical' | 'normal';

export interface HealthMetric {
  id: string;
  domain: string;
  label: string;
  status: HealthStatus;
  statusText: string;
  trend: 'up' | 'down' | 'flat' | 'warning';
  evidence: {
    primaryValue: string;
    detail1: string;
    detail2: string;
    subtext: string;
  };
  suggestedAction?: string;
  targetTab?: NavigationTab;
}

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  revenue: number; // in INR
  formattedRevenue: string;
  lastActivity: string;
  lastActivityDaysAgo: number;
  status: 'Active' | 'Attention' | 'At Risk' | 'New';
  healthScore: number; // 0 - 100
  openInvoicesCount: number;
  openInvoicesAmount: number;
  openOpportunitiesCount: number;
  openOpportunitiesAmount: number;
  avatarBg: string;
  tags: string[];
  notes: string[];
  industry: string;
}

export interface Deal {
  id: string;
  title: string;
  customerId: string;
  customerName: string;
  value: number; // in INR
  formattedValue: string;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  probability: number;
  lastContactDaysAgo: number;
  isStale: boolean;
  assignedTo: string;
  expectedCloseDate: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  formattedAmount: string;
  issueDate: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue' | 'draft';
  daysOverdue?: number;
  items: { description: string; quantity: number; rate: number; total: number }[];
}

export interface Expense {
  id: string;
  title: string;
  category: 'Marketing' | 'Software & Subscriptions' | 'Operations' | 'Payroll' | 'Travel' | 'Infrastructure';
  amount: number;
  formattedAmount: string;
  date: string;
  vendor: string;
  status: 'approved' | 'pending_approval' | 'rejected';
  requestedBy: string;
  isAnomaly?: boolean;
  anomalyNote?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'todo' | 'in_progress' | 'completed';
  dueDate: string;
  assignedTo: string;
  // Business outcome linkage chain
  customerId?: string;
  customerName?: string;
  dealId?: string;
  dealTitle?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  potentialRevenue?: string;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  timeLabel: string;
  title: string;
  entityName: string;
  amount?: string;
  category: 'finance' | 'customers' | 'sales' | 'work' | 'system';
  iconType: 'invoice' | 'customer' | 'deal' | 'expense' | 'task' | 'alert';
  severity?: 'normal' | 'success' | 'warning' | 'danger';
}

export interface AIInsight {
  id: string;
  type: 'receivables' | 'sales' | 'anomaly' | 'runway' | 'retention';
  severity: 'warning' | 'opportunity' | 'anomaly' | 'info';
  title: string;
  summary: string;
  whyItMatters: string;
  suggestedAction: string;
  actionButtonText: string;
  actionPayload: {
    type: 'follow_up_email' | 'review_invoices' | 'investigate_expense' | 'view_deal';
    targetId?: string;
    targetName?: string;
    amount?: string;
    suggestedContent?: string;
  };
  metricsHighlight?: string;
}

export interface OperationalTodayItem {
  id: string;
  category: 'Critical' | 'High Priority' | 'Upcoming' | 'Decision';
  title: string;
  subtitle: string;
  actionText: string;
  badgeText?: string;
  badgeColor?: 'rose' | 'amber' | 'blue' | 'purple';
  actionPayload: {
    type: 'review_invoices' | 'follow_up_customer' | 'meeting_prep' | 'review_expenses' | 'custom';
    targetId?: string;
    details?: string;
  };
  isDone?: boolean;
}

export interface AlertItem {
  id: string;
  severity: 'critical' | 'attention' | 'warning' | 'info';
  category: 'Financial' | 'Customer' | 'Operations' | 'System';
  title: string;
  whatHappened: string;
  whyItMatters: string;
  whatCanIDo: string;
  actionButtonText: string;
  timestamp: string;
  isRead: boolean;
  actionPayload?: any;
}

export interface IntegrationService {
  id: string;
  name: string;
  category: 'Banking' | 'Accounting' | 'CRM' | 'Email & Cal' | 'Communication' | 'Payment';
  status: 'connected' | 'available' | 'syncing' | 'error';
  lastSynced?: string;
  iconName: string;
  description: string;
  features: string[];
}
