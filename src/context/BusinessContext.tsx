import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { mutate as mutateSWR } from 'swr';
import { 
  NavigationTab, 
  Customer, 
  Deal, 
  Invoice, 
  Expense, 
  Task, 
  ActivityEvent, 
  AIInsight, 
  OperationalTodayItem, 
  AlertItem, 
  HealthMetric,
  IntegrationService 
} from '../types';
import { saveCustomer } from '../components/customers/customerApi';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  description: string;
}

export interface DashboardWidgetConfig {
  id: string;
  title: string;
  visible: boolean;
  order: number;
}

interface AIActionModalState {
  isOpen: boolean;
  title: string;
  level: number; // 1 to 6
  source: string;
  description: string;
  actionDraft: {
    recipient?: string;
    subject?: string;
    content?: string;
    payloadType: string;
    targetId?: string;
    amount?: string;
  };
}

interface BusinessContextType {
  // Navigation
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  customerSubTab: string;
  setCustomerSubTab: (tab: any) => void;
  financeSubTab: string;
  setFinanceSubTab: (tab: any) => void;
  workSubTab: string;
  setWorkSubTab: (tab: any) => void;
  analyticsSubTab: string;
  setAnalyticsSubTab: (tab: any) => void;
  aiSubTab: string;
  setAISubTab: (tab: any) => void;

  // Selected Entities
  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;
  selectedInvoice: Invoice | null;
  setSelectedInvoice: (invoice: Invoice | null) => void;
  
  // Modals & Drawers
  isCommandMenuOpen: boolean;
  setIsCommandMenuOpen: (open: boolean) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;
  aiActionModal: AIActionModalState;
  openAIActionModal: (state: Partial<AIActionModalState>) => void;
  closeAIActionModal: () => void;

  // Domain State
  healthMetrics: HealthMetric[];
  customers: Customer[];
  deals: Deal[];
  invoices: Invoice[];
  expenses: Expense[];
  tasks: Task[];
  todayItems: OperationalTodayItem[];
  activityEvents: ActivityEvent[];
  aiInsights: AIInsight[];
  alerts: AlertItem[];
  integrations: IntegrationService[];

  // Widget Configuration
  dashboardWidgets: DashboardWidgetConfig[];
  toggleWidgetVisibility: (widgetId: string) => void;
  moveWidget: (widgetId: string, direction: 'up' | 'down') => void;
  resetDashboardWidgets: () => void;

  // Business Action Handlers
  markInvoicePaid: (invoiceId: string) => void;
  sendInvoiceReminder: (invoiceId: string) => void;
  approveExpense: (expenseId: string) => void;
  rejectExpense: (expenseId: string) => void;
  completeTask: (taskId: string) => void;
  advanceDealStage: (dealId: string, newStage: Deal['stage']) => void;
  markAlertRead: (alertId: string) => void;
  
  // Creation Handlers
  createCustomer: (customerData: Partial<Customer>) => void | Promise<void>;
  createInvoice: (invoiceData: Partial<Invoice>) => void;
  createExpense: (expenseData: Partial<Expense>) => void;
  createTask: (taskData: Partial<Task>) => void;
  createDeal: (dealData: Partial<Deal>) => void;
  executeNaturalLanguageAction: (promptText: string) => boolean;

  // Toast System
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

const DEFAULT_DASHBOARD_WIDGETS: DashboardWidgetConfig[] = [
  { id: 'kpis', title: 'Key metrics', visible: true, order: 1 },
  { id: 'today', title: 'Today', visible: true, order: 2 },
  { id: 'health', title: 'Business health', visible: true, order: 3 },
  { id: 'ai_insights', title: 'AI insights', visible: true, order: 4 },
  { id: 'finance_chart', title: 'Finance summary', visible: true, order: 5 },
  { id: 'pipeline_summary', title: 'Sales pipeline', visible: true, order: 6 },
  { id: 'activity_stream', title: 'Activity', visible: true, order: 7 },
];

const isDashboardWidgetConfig = (value: unknown): value is DashboardWidgetConfig => {
  if (!value || typeof value !== 'object') return false;
  const widget = value as Record<string, unknown>;
  return typeof widget.id === 'string'
    && typeof widget.title === 'string'
    && typeof widget.visible === 'boolean'
    && typeof widget.order === 'number'
    && Number.isFinite(widget.order);
};

interface LocalStorageSnapshot {
  failures: Set<string>;
  widgets: DashboardWidgetConfig[];
  deals: Deal[];
  invoices: Invoice[];
  expenses: Expense[];
  tasks: Task[];
  activities: ActivityEvent[];
}

function readStoredArray<T>(key: string, failures: Set<string>): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = window.localStorage.getItem(key);
    if (saved === null) return [];
    const parsed: unknown = JSON.parse(saved);
    if (Array.isArray(parsed)) return parsed as T[];
    failures.add(key);
    console.error(`Unable to read local data for ${key}: expected an array.`);
  } catch (error) {
    failures.add(key);
    console.error(`Unable to read local data for ${key}.`, error);
  }
  return [];
}

function readLocalStorageSnapshot(): LocalStorageSnapshot {
  const failures = new Set<string>();
  const widgetsKey = 'look-through.dashboard-widgets';
  let widgets = DEFAULT_DASHBOARD_WIDGETS;
  if (typeof window !== 'undefined') {
    try {
      const saved = window.localStorage.getItem(widgetsKey);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length && parsed.every(isDashboardWidgetConfig)) widgets = parsed;
        else {
          failures.add(widgetsKey);
          console.error(`Unable to read local data for ${widgetsKey}: invalid widget configuration.`);
        }
      }
    } catch (error) {
      failures.add(widgetsKey);
      console.error('Unable to read local dashboard widget settings.', error);
    }
  }
  return {
    failures,
    widgets,
    deals: readStoredArray<Deal>('lookthrough_deals', failures),
    invoices: readStoredArray<Invoice>('lookthrough_invoices', failures),
    expenses: readStoredArray<Expense>('lookthrough_expenses', failures),
    tasks: readStoredArray<Task>('lookthrough_tasks', failures),
    activities: readStoredArray<ActivityEvent>('lookthrough_activities', failures),
  };
}

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [localStorageSnapshot] = useState(readLocalStorageSnapshot);

  const [activeTab, setActiveTab] = useState<NavigationTab>('overview');
  const [customerSubTab, setCustomerSubTab] = useState('customers');
  const [financeSubTab, setFinanceSubTab] = useState('overview');
  const [workSubTab, setWorkSubTab] = useState('today');
  const [analyticsSubTab, setAnalyticsSubTab] = useState('performance');
  const [aiSubTab, setAISubTab] = useState('insights');

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [dashboardWidgets, setDashboardWidgets] = useState<DashboardWidgetConfig[]>(localStorageSnapshot.widgets);

  const [healthMetrics] = useState<HealthMetric[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [deals, setDeals] = useState<Deal[]>(localStorageSnapshot.deals);
  const [invoices, setInvoices] = useState<Invoice[]>(localStorageSnapshot.invoices);
  const [expenses, setExpenses] = useState<Expense[]>(localStorageSnapshot.expenses);
  const [tasks, setTasks] = useState<Task[]>(localStorageSnapshot.tasks);
  const [todayItems, setTodayItems] = useState<OperationalTodayItem[]>([]);
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>(localStorageSnapshot.activities);
  const [aiInsights] = useState<AIInsight[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [integrations] = useState<IntegrationService[]>([
    {
      id: 'google',
      name: 'Google Workspace',
      category: 'Email & Cal',
      description: 'Planned calendar and email connector. Setup is not available in this workspace.',
      iconName: 'google',
      status: 'available',
      features: ['Calendar sync', 'Email logs'],
    },
    {
      id: 'razorpay',
      name: 'Razorpay / UPI Gateway',
      category: 'Payment',
      description: 'Planned payment connector. No reconciliation is currently running.',
      iconName: 'razorpay',
      status: 'available',
      features: ['Payment reconciliation', 'Instant settlements'],
    },
    {
      id: 'stripe',
      name: 'Stripe International',
      category: 'Payment',
      description: 'Planned international payment connector. Setup is not available.',
      iconName: 'stripe',
      status: 'available',
      features: ['Multi-currency cards', 'Subscription billing'],
    },
    {
      id: 'zoho',
      name: 'Zoho Books / Tally Prime',
      category: 'Accounting',
      description: 'Planned accounting connector. No ledger synchronization is currently running.',
      iconName: 'zoho',
      status: 'available',
      features: ['GST invoice sync', 'Ledger mapping'],
    },
  ]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const persistenceFailureReported = useRef(false);
  useEffect(() => {
    try {
      const persist = <T,>(key: string, value: T, initialValue: T) => {
        if (localStorageSnapshot.failures.has(key)) {
          if (value === initialValue) return;
        }
        localStorage.setItem(key, JSON.stringify(value));
      };
      persist('look-through.dashboard-widgets', dashboardWidgets, localStorageSnapshot.widgets);
      persist('lookthrough_deals', deals, localStorageSnapshot.deals);
      persist('lookthrough_invoices', invoices, localStorageSnapshot.invoices);
      persist('lookthrough_expenses', expenses, localStorageSnapshot.expenses);
      persist('lookthrough_tasks', tasks, localStorageSnapshot.tasks);
      persist('lookthrough_activities', activityEvents, localStorageSnapshot.activities);
      persistenceFailureReported.current = false;
    } catch (error) {
      if (!persistenceFailureReported.current) {
        const message = error instanceof Error ? error.message : 'Browser storage is unavailable.';
        setToasts(prev => [...prev, {
          id: `${Date.now().toString(36)}-storage`,
          type: 'error',
          title: 'Local data was not saved',
          description: `Some changes may be available only until this page is closed. ${message}`,
        }]);
        persistenceFailureReported.current = true;
      }
    }
  }, [dashboardWidgets, deals, invoices, expenses, tasks, activityEvents, localStorageSnapshot]);

  // Derive Today Items dynamically from real invoices, tasks, and expenses
  useEffect(() => {
    const items: OperationalTodayItem[] = [];

    invoices.filter(inv => inv.status === 'overdue').forEach(inv => {
      items.push({
        id: `today-inv-${inv.id}`,
        title: `Recover overdue receivables for ${inv.customerName}`,
        subtitle: `Invoice ${inv.invoiceNumber} for ${inv.formattedAmount} is overdue.`,
        category: 'Critical',
        actionText: 'Preview reminder',
        actionPayload: {
          type: 'follow_up_customer',
          targetId: inv.id,
          details: `${inv.customerName} · ${inv.formattedAmount}`,
        },
      });
    });

    tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled' && (t.priority === 'critical' || t.priority === 'high')).forEach(t => {
      items.push({
        id: `today-task-${t.id}`,
        title: t.title,
        subtitle: t.description || `Priority: ${t.priority}`,
        category: t.priority === 'critical' ? 'Critical' : 'High Priority',
        actionText: 'Open in Work',
        actionPayload: {
          type: 'custom',
          targetId: t.id,
          details: t.title,
        },
      });
    });

    expenses.filter(e => e.status === 'pending_approval').forEach(e => {
      items.push({
        id: `today-exp-${e.id}`,
        title: `Approve expense: ${e.title}`,
        subtitle: `${e.formattedAmount} for ${e.vendor} (${e.category})`,
        category: 'Decision',
        actionText: 'Review Expense',
        actionPayload: {
          type: 'review_expenses',
          targetId: e.id,
          details: `${e.vendor} · ${e.formattedAmount}`,
        },
      });
    });

    setTodayItems(items);
  }, [invoices, tasks, expenses]);

  // Derive Alerts dynamically from real business events
  useEffect(() => {
    const derivedAlerts: AlertItem[] = [];

    const overdueInvs = invoices.filter(i => i.status === 'overdue');
    if (overdueInvs.length > 0) {
      const totalOverdue = overdueInvs.reduce((sum, i) => sum + i.amount, 0);
      derivedAlerts.push({
        id: 'alert-overdue-receivables',
        title: `Overdue Receivables: ₹${totalOverdue.toLocaleString('en-IN')}`,
        category: 'Financial',
        severity: 'critical',
        whatHappened: `${overdueInvs.length} customer invoices are past due date, delaying cash inflows.`,
        whyItMatters: 'Overdue receivables compress working capital and increase bad debt risk.',
        whatCanIDo: 'Review reminder drafts for overdue invoices. No message is sent.',
        actionButtonText: 'Review Receivables',
        timestamp: 'Active',
        isRead: false,
      });
    }

    const pendingExps = expenses.filter(e => e.status === 'pending_approval');
    if (pendingExps.length > 0) {
      derivedAlerts.push({
        id: 'alert-pending-expenses',
        title: `${pendingExps.length} Expenses Awaiting Approval`,
        category: 'Operations',
        severity: 'warning',
        whatHappened: 'Operational expenditures submitted by the team require authorization.',
        whyItMatters: 'This browser-local status is not connected to a payment workflow.',
        whatCanIDo: 'Review local expense details. No disbursement or notification is sent.',
        actionButtonText: 'Review Expenses',
        timestamp: 'Active',
        isRead: false,
      });
    }

    const urgentTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled' && t.priority === 'critical');
    if (urgentTasks.length > 0) {
      derivedAlerts.push({
        id: 'alert-critical-tasks',
        title: `${urgentTasks.length} Critical Task(s) Requiring Attention`,
        category: 'Operations',
        severity: 'warning',
        whatHappened: `Urgent task "${urgentTasks[0].title}" requires completion today.`,
        whyItMatters: 'Critical path tasks block operational delivery and client satisfaction.',
        whatCanIDo: 'Open Work to review and update local task records.',
        actionButtonText: 'Open Work',
        timestamp: 'Active',
        isRead: false,
      });
    }

    setAlerts(derivedAlerts);
  }, [invoices, expenses, tasks]);

  const [aiActionModal, setAIActionModal] = useState<AIActionModalState>({
    isOpen: false,
    title: '',
    level: 4,
    source: '',
    description: '',
    actionDraft: {
      payloadType: '',
    },
  });

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString(36) + '-' + Math.floor(Math.random() * 100000).toString(36);
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const openAIActionModal = (config: Partial<AIActionModalState>) => {
    setAIActionModal(prev => ({
      ...prev,
      ...config,
      isOpen: true,
    }));
  };

  const closeAIActionModal = () => {
    setAIActionModal(prev => ({ ...prev, isOpen: false }));
  };

  // Widget management
  const toggleWidgetVisibility = (widgetId: string) => {
    setDashboardWidgets(prev => 
      prev.map(w => w.id === widgetId ? { ...w, visible: !w.visible } : w)
    );
  };

  const moveWidget = (widgetId: string, direction: 'up' | 'down') => {
    setDashboardWidgets(prev => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const index = sorted.findIndex(w => w.id === widgetId);
      if (index === -1) return prev;
      if (direction === 'up' && index > 0) {
        const tempOrder = sorted[index].order;
        sorted[index].order = sorted[index - 1].order;
        sorted[index - 1].order = tempOrder;
      } else if (direction === 'down' && index < sorted.length - 1) {
        const tempOrder = sorted[index].order;
        sorted[index].order = sorted[index + 1].order;
        sorted[index + 1].order = tempOrder;
      }
      return [...sorted];
    });
  };

  const resetDashboardWidgets = () => {
    setDashboardWidgets(DEFAULT_DASHBOARD_WIDGETS);
    addToast({
      type: 'info',
      title: 'Layout Reset',
      description: 'Dashboard widgets restored to factory defaults.',
    });
  };

  // Business Action handlers
  const markInvoicePaid = (invoiceId: string) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        return { ...inv, status: 'paid', daysOverdue: undefined };
      }
      return inv;
    }));

    const inv = invoices.find(i => i.id === invoiceId);
    const entityTitle = inv ? `${inv.customerName} · ${inv.formattedAmount}` : invoiceId;

    // Add activity event
    const newEvent: ActivityEvent = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeLabel: 'Just now',
      title: `Invoice ${inv?.invoiceNumber || invoiceId} marked as paid locally`,
      entityName: entityTitle,
      amount: inv?.formattedAmount,
      category: 'finance',
      iconType: 'invoice',
      severity: 'success',
    };
    setActivityEvents(prev => [newEvent, ...prev]);

    addToast({
      type: 'success',
      title: 'Invoice status updated locally',
      description: `Invoice ${inv?.invoiceNumber} is marked paid in this browser only. No payment was processed.`,
    });
  };

  const sendInvoiceReminder = (invoiceId: string) => {
    const inv = invoices.find(i => i.id === invoiceId);
    if (!inv) return;

    openAIActionModal({
      title: `Review payment reminder draft for ${inv.invoiceNumber}`,
      level: 4,
      source: 'Invoice workflow',
      description: `Review this local invoice record. This preview will not send an email or generate a payment link.`,
      actionDraft: {
        subject: `Payment Reminder: Invoice ${inv.invoiceNumber} for ${inv.formattedAmount}`,
        content: `Dear Accounts Team,\n\nThis is a reminder that Invoice ${inv.invoiceNumber} (${inv.formattedAmount}) was due on ${inv.dueDate}.\n\nPlease review the invoice details and arrange payment through your usual payment channel.\n\nThank you.`,
        payloadType: 'payment_reminder',
        targetId: inv.id,
        amount: inv.formattedAmount,
      },
    });
  };

  const approveExpense = (expenseId: string) => {
    setExpenses(prev => prev.map(e => e.id === expenseId ? { ...e, status: 'approved' } : e));
    const exp = expenses.find(e => e.id === expenseId);
    
    addToast({
      type: 'success',
      title: 'Expense status updated locally',
      description: `${exp?.title} is marked approved in this browser only. No disbursement was authorized.`,
    });

    const newEvent: ActivityEvent = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeLabel: 'Just now',
      title: `Expense marked approved locally`,
      entityName: `${exp?.category} · ${exp?.formattedAmount}`,
      amount: exp?.formattedAmount,
      category: 'finance',
      iconType: 'expense',
      severity: 'normal'
    };
    setActivityEvents(prev => [newEvent, ...prev]);
  };

  const rejectExpense = (expenseId: string) => {
    setExpenses(prev => prev.map(e => e.id === expenseId ? { ...e, status: 'rejected' } : e));
    const exp = expenses.find(e => e.id === expenseId);
    addToast({
      type: 'warning',
      title: 'Expense status updated locally',
      description: `${exp?.title} is marked rejected in this browser only. No requester was notified.`,
    });
  };

  const completeTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed' } : t));
    const task = tasks.find(t => t.id === taskId);
    addToast({
      type: 'success',
      title: 'Task status updated locally',
      description: `"${task?.title}" is marked done in this browser only.`,
    });
  };

  const advanceDealStage = (dealId: string, newStage: Deal['stage']) => {
    setDeals(prev => prev.map(d => {
      if (d.id === dealId) {
        return { ...d, stage: newStage };
      }
      return d;
    }));
    const deal = deals.find(d => d.id === dealId);
    addToast({
      type: 'info',
      title: 'Deal stage updated locally',
      description: `"${deal?.title}" moved to ${newStage.toUpperCase()} in this browser only.`,
    });

    const newEvent: ActivityEvent = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeLabel: 'Just now',
      title: `Deal moved to ${newStage} locally`,
      entityName: `${deal?.customerName} · ${deal?.formattedValue}`,
      amount: deal?.formattedValue,
      category: 'sales',
      iconType: 'deal',
      severity: newStage === 'won' ? 'success' : 'normal'
    };
    setActivityEvents(prev => [newEvent, ...prev]);
  };

  const markAlertRead = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, isRead: true } : a));
  };

  // Creation functions
  const createCustomer = async (data: Partial<Customer>) => {
    try {
    const created = await saveCustomer({ name: data.name || '', email: data.email, phone: data.phone });
    await mutateSWR((key) => typeof key === 'string' && key.startsWith('/api/customers?'));
    addToast({ type: 'success', title: 'Customer Created', description: `Account for ${created.name} successfully initialized.` });
    } catch (error) {
      addToast({ type: 'error', title: 'Customer Not Created', description: error instanceof Error ? error.message : 'Customer could not be saved.' });
    }
  };

  const createInvoice = (data: Partial<Invoice>) => {
    const customerName = data.customerName?.trim();
    const amountVal = data.amount;
    const dueDate = data.dueDate?.trim();
    if (!data.customerId || !customerName || !Number.isFinite(amountVal) || !amountVal || amountVal <= 0 || !dueDate) {
      addToast({ type: 'error', title: 'Invoice draft not created', description: 'Select a saved customer and provide a positive amount and due date.' });
      return;
    }

    const newInv: Invoice = {
      id: `inv-${Math.floor(1000 + Math.random() * 9000)}`,
      invoiceNumber: `#${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: data.customerId,
      customerName,
      amount: amountVal,
      formattedAmount: `₹${amountVal.toLocaleString('en-IN')}`,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate,
      status: data.status || 'draft',
      items: data.items || []
    };

    setInvoices(prev => [newInv, ...prev]);
    addToast({
      type: 'info',
      title: 'Invoice draft added',
      description: `${newInv.invoiceNumber} is saved in this browser only. It was not issued or sent.`,
    });

    const newEvent: ActivityEvent = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeLabel: 'Just now',
      title: `Invoice draft ${newInv.invoiceNumber} created locally`,
      entityName: `${newInv.customerName} · ${newInv.formattedAmount}`,
      amount: newInv.formattedAmount,
      category: 'finance',
      iconType: 'invoice',
      severity: 'normal'
    };
    setActivityEvents(prev => [newEvent, ...prev]);
  };

  const createExpense = (data: Partial<Expense>) => {
    const title = data.title?.trim();
    const amountVal = data.amount;
    if (!title || !Number.isFinite(amountVal) || !amountVal || amountVal <= 0) {
      addToast({ type: 'error', title: 'Expense draft not created', description: 'Provide a description and a positive amount.' });
      return;
    }
    const newExp: Expense = {
      id: `exp-${Date.now()}`,
      title,
      category: data.category || 'Operations',
      amount: amountVal,
      formattedAmount: `₹${amountVal.toLocaleString('en-IN')}`,
      date: new Date().toISOString().split('T')[0],
      vendor: data.vendor?.trim() || 'Not specified',
      status: 'pending_approval',
      requestedBy: 'Not specified',
    };

    setExpenses(prev => [newExp, ...prev]);
    addToast({
      type: 'info',
      title: 'Expense draft added',
      description: `${newExp.title} is saved in this browser only. It was not submitted for approval.`,
    });
  };

  const createTask = (data: Partial<Task>) => {
    const title = data.title?.trim();
    if (!title) {
      addToast({ type: 'error', title: 'Task not created', description: 'Enter a task title.' });
      return;
    }
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      description: data.description || '',
      priority: data.priority || 'medium',
      status: 'todo',
      dueDate: data.dueDate || 'No due date',
      assignedTo: data.assignedTo || 'Unassigned',
      customerId: data.customerId,
      customerName: data.customerName,
      potentialRevenue: data.potentialRevenue,
    };

    setTasks(prev => [newTask, ...prev]);
    addToast({
      type: 'info',
      title: 'Task added locally',
      description: `"${newTask.title}" is saved in this browser only.`,
    });
  };

  const createDeal = (data: Partial<Deal>) => {
    const title = data.title?.trim();
    const customerName = data.customerName?.trim();
    const valueVal = data.value;
    if (!title || !data.customerId || !customerName || !Number.isFinite(valueVal) || !valueVal || valueVal <= 0 ||
      !Number.isFinite(data.probability) || data.probability === undefined || data.probability < 0 || data.probability > 100) {
      addToast({ type: 'error', title: 'Deal draft not created', description: 'Provide a title, saved customer, positive value, and probability from 0 to 100.' });
      return;
    }
    const newDeal: Deal = {
      id: `deal-${Date.now()}`,
      title,
      customerId: data.customerId,
      customerName,
      value: valueVal,
      formattedValue: `₹${(valueVal / 100000).toFixed(1)}L`,
      stage: data.stage || 'lead',
      probability: data.probability,
      assignedTo: data.assignedTo?.trim() || 'Unassigned',
      expectedCloseDate: data.expectedCloseDate?.trim() || '',
    };

    setDeals(prev => [newDeal, ...prev]);
    addToast({
      type: 'info',
      title: 'Deal draft added',
      description: `${newDeal.formattedValue} with ${newDeal.customerName} is saved in this browser only.`,
    });
  };

  // Natural Language fast action parser
  const executeNaturalLanguageAction = (promptText: string): boolean => {
    const match = promptText.trim().match(/^task:\s*(.+)$/i);
    if (!match) return false;
    createTask({ title: match[1].trim() });
    return true;
  };

  return (
    <BusinessContext.Provider
      value={{
        activeTab,
        setActiveTab,
        customerSubTab,
        setCustomerSubTab,
        financeSubTab,
        setFinanceSubTab,
        workSubTab,
        setWorkSubTab,
        analyticsSubTab,
        setAnalyticsSubTab,
        aiSubTab,
        setAISubTab,

        selectedCustomer,
        setSelectedCustomer,
        selectedInvoice,
        setSelectedInvoice,

        isCommandMenuOpen,
        setIsCommandMenuOpen,
        isCreateModalOpen,
        setIsCreateModalOpen,
        isNotificationsOpen,
        setIsNotificationsOpen,
        aiActionModal,
        openAIActionModal,
        closeAIActionModal,

        healthMetrics,
        customers,
        deals,
        invoices,
        expenses,
        tasks,
        todayItems,
        activityEvents,
        aiInsights,
        alerts,
        integrations,

        dashboardWidgets,
        toggleWidgetVisibility,
        moveWidget,
        resetDashboardWidgets,

        markInvoicePaid,
        sendInvoiceReminder,
        approveExpense,
        rejectExpense,
        completeTask,
        advanceDealStage,
        markAlertRead,

        createCustomer,
        createInvoice,
        createExpense,
        createTask,
        createDeal,
        executeNaturalLanguageAction,

        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};
