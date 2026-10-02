import React, { createContext, useContext, useState } from 'react';
import confetti from 'canvas-confetti';
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
import { 
  INITIAL_HEALTH_METRICS, 
  INITIAL_CUSTOMERS, 
  INITIAL_DEALS, 
  INITIAL_INVOICES, 
  INITIAL_EXPENSES, 
  INITIAL_TASKS, 
  INITIAL_TODAY_ITEMS, 
  INITIAL_ACTIVITY_EVENTS, 
  INITIAL_AI_INSIGHTS, 
  INITIAL_ALERTS, 
  INITIAL_INTEGRATIONS 
} from '../data/mockData';

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
  onExecute?: () => void;
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
  toggleTodayItemDone: (itemId: string) => void;
  advanceDealStage: (dealId: string, newStage: Deal['stage']) => void;
  toggleIntegration: (integrationId: string) => void;
  markAlertRead: (alertId: string) => void;
  
  // Creation Handlers
  createCustomer: (customerData: Partial<Customer>) => void;
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
  { id: 'kpis', title: 'Key Performance Indicators', visible: true, order: 1 },
  { id: 'today', title: 'Operational Command Center (Today)', visible: true, order: 2 },
  { id: 'health', title: 'Business Health Matrix', visible: true, order: 3 },
  { id: 'ai_insights', title: 'Proactive AI Intelligence', visible: true, order: 4 },
  { id: 'finance_chart', title: 'Revenue vs Expenses & Runway', visible: true, order: 5 },
  { id: 'pipeline_summary', title: 'Sales Pipeline Velocity', visible: true, order: 6 },
  { id: 'activity_stream', title: 'Live Business Event Stream', visible: true, order: 7 },
];

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  const [dashboardWidgets, setDashboardWidgets] = useState<DashboardWidgetConfig[]>(DEFAULT_DASHBOARD_WIDGETS);

  const [healthMetrics] = useState<HealthMetric[]>(INITIAL_HEALTH_METRICS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [todayItems, setTodayItems] = useState<OperationalTodayItem[]>(INITIAL_TODAY_ITEMS);
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>(INITIAL_ACTIVITY_EVENTS);
  const [aiInsights] = useState<AIInsight[]>(INITIAL_AI_INSIGHTS);
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [integrations, setIntegrations] = useState<IntegrationService[]>(INITIAL_INTEGRATIONS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

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
    const id = Math.random().toString(36).substring(2, 9);
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
      title: `Invoice ${inv?.invoiceNumber || invoiceId} marked as paid`,
      entityName: entityTitle,
      amount: inv?.formattedAmount,
      category: 'finance',
      iconType: 'invoice',
      severity: 'success',
    };
    setActivityEvents(prev => [newEvent, ...prev]);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#10b981', '#3b82f6', '#8b5cf6']
    });

    addToast({
      type: 'success',
      title: 'Payment Received',
      description: `Invoice ${inv?.invoiceNumber} was successfully marked as paid. Cash flow updated.`,
    });
  };

  const sendInvoiceReminder = (invoiceId: string) => {
    const inv = invoices.find(i => i.id === invoiceId);
    if (!inv) return;

    openAIActionModal({
      title: `Dispatch AI Payment Reminder for ${inv.invoiceNumber}`,
      level: 4,
      source: 'Receivables Automated Chaser',
      description: `Invoice for ${inv.formattedAmount} is overdue. AI has composed a polite follow-up with instant UPI & card payment links.`,
      actionDraft: {
        recipient: `${inv.customerName} Billing Desk <billing@customer.com>`,
        subject: `Payment Reminder: Invoice ${inv.invoiceNumber} for ${inv.formattedAmount}`,
        content: `Dear Accounts Team,\n\nWe hope you are well. This is a gentle reminder that Invoice ${inv.invoiceNumber} (${inv.formattedAmount}) was due on ${inv.dueDate}.\n\nYou can settle this invoice securely in one click via Razorpay/Stripe: https://pay.businessos.internal/inv/${inv.id}\n\nThank you for your business,\nPradumn Saindane · Apex Global Corp`,
        payloadType: 'payment_reminder',
        targetId: inv.id,
        amount: inv.formattedAmount,
      },
      onExecute: () => {
        addToast({
          type: 'success',
          title: 'Reminder Sent Successfully',
          description: `AI reminder and payment link delivered to ${inv.customerName}.`,
        });
        const newEvent: ActivityEvent = {
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          timeLabel: 'Just now',
          title: `Payment reminder dispatched`,
          entityName: `${inv.customerName} · ${inv.invoiceNumber}`,
          category: 'finance',
          iconType: 'invoice',
          severity: 'normal'
        };
        setActivityEvents(prev => [newEvent, ...prev]);
      }
    });
  };

  const approveExpense = (expenseId: string) => {
    setExpenses(prev => prev.map(e => e.id === expenseId ? { ...e, status: 'approved' } : e));
    const exp = expenses.find(e => e.id === expenseId);
    
    addToast({
      type: 'success',
      title: 'Expense Approved',
      description: `${exp?.title} (${exp?.formattedAmount}) has been authorized for disbursement.`,
    });

    const newEvent: ActivityEvent = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeLabel: 'Just now',
      title: `Expense approved`,
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
      title: 'Expense Rejected',
      description: `${exp?.title} was returned to requester for cost revision.`,
    });
  };

  const completeTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed' } : t));
    const task = tasks.find(t => t.id === taskId);
    addToast({
      type: 'success',
      title: 'Task Completed',
      description: `"${task?.title}" marked done. Business outcome updated.`,
    });
  };

  const toggleTodayItemDone = (itemId: string) => {
    setTodayItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const nextDone = !item.isDone;
        if (nextDone) {
          confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
        }
        return { ...item, isDone: nextDone };
      }
      return item;
    }));
  };

  const advanceDealStage = (dealId: string, newStage: Deal['stage']) => {
    setDeals(prev => prev.map(d => {
      if (d.id === dealId) {
        return { ...d, stage: newStage, lastContactDaysAgo: 0, isStale: false };
      }
      return d;
    }));
    const deal = deals.find(d => d.id === dealId);
    addToast({
      type: 'info',
      title: 'Pipeline Updated',
      description: `Deal "${deal?.title}" moved to ${newStage.toUpperCase()}.`,
    });

    const newEvent: ActivityEvent = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeLabel: 'Just now',
      title: `Deal moved to ${newStage}`,
      entityName: `${deal?.customerName} · ${deal?.formattedValue}`,
      amount: deal?.formattedValue,
      category: 'sales',
      iconType: 'deal',
      severity: newStage === 'won' ? 'success' : 'normal'
    };
    setActivityEvents(prev => [newEvent, ...prev]);
  };

  const toggleIntegration = (integrationId: string) => {
    setIntegrations(prev => prev.map(int => {
      if (int.id === integrationId) {
        const newStatus = int.status === 'connected' ? 'available' : 'connected';
        return { 
          ...int, 
          status: newStatus,
          lastSynced: newStatus === 'connected' ? 'Just now' : undefined 
        };
      }
      return int;
    }));
    const int = integrations.find(i => i.id === integrationId);
    addToast({
      type: 'info',
      title: 'Integration State Changed',
      description: `${int?.name} status updated. Sync pipeline active.`,
    });
  };

  const markAlertRead = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, isRead: true } : a));
  };

  // Creation functions
  const createCustomer = (data: Partial<Customer>) => {
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: data.name || 'New Client Enterprise',
      company: data.company || data.name || 'Enterprise Co',
      email: data.email || 'contact@company.com',
      phone: data.phone || '+91 98000 00000',
      revenue: data.revenue || 0,
      formattedRevenue: data.revenue ? `₹${(data.revenue / 100000).toFixed(1)}L` : '₹0',
      lastActivity: 'Today',
      lastActivityDaysAgo: 0,
      status: 'New',
      healthScore: 85,
      openInvoicesCount: 0,
      openInvoicesAmount: 0,
      openOpportunitiesCount: 0,
      openOpportunitiesAmount: 0,
      avatarBg: 'from-blue-600 to-cyan-700',
      tags: data.tags || ['New Account', 'Active'],
      industry: data.industry || 'Technology & Business Services',
      notes: ['Customer created via Universal Create Menu.'],
    };

    setCustomers(prev => [newCust, ...prev]);
    addToast({
      type: 'success',
      title: 'Customer Created',
      description: `Account for ${newCust.name} successfully initialized.`,
    });

    const newEvent: ActivityEvent = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeLabel: 'Just now',
      title: 'New customer created',
      entityName: newCust.name,
      category: 'customers',
      iconType: 'customer',
      severity: 'normal'
    };
    setActivityEvents(prev => [newEvent, ...prev]);
  };

  const createInvoice = (data: Partial<Invoice>) => {
    const amountVal = data.amount || 50000;
    const newInv: Invoice = {
      id: `inv-${Math.floor(1000 + Math.random() * 9000)}`,
      invoiceNumber: `#${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: data.customerId || 'cust-1',
      customerName: data.customerName || 'Acme Ltd',
      amount: amountVal,
      formattedAmount: `₹${amountVal.toLocaleString('en-IN')}`,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: data.dueDate || '2026-10-31',
      status: data.status || 'pending',
      items: data.items || [
        { description: 'Business OS Enterprise Consulting Services', quantity: 1, rate: amountVal, total: amountVal }
      ]
    };

    setInvoices(prev => [newInv, ...prev]);
    addToast({
      type: 'success',
      title: 'Invoice Generated',
      description: `Invoice ${newInv.invoiceNumber} for ${newInv.formattedAmount} issued to ${newInv.customerName}.`,
    });

    const newEvent: ActivityEvent = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeLabel: 'Just now',
      title: `Invoice ${newInv.invoiceNumber} created`,
      entityName: `${newInv.customerName} · ${newInv.formattedAmount}`,
      amount: newInv.formattedAmount,
      category: 'finance',
      iconType: 'invoice',
      severity: 'normal'
    };
    setActivityEvents(prev => [newEvent, ...prev]);
  };

  const createExpense = (data: Partial<Expense>) => {
    const amountVal = data.amount || 25000;
    const newExp: Expense = {
      id: `exp-${Date.now()}`,
      title: data.title || 'Operational Software Tooling',
      category: data.category || 'Software & Subscriptions',
      amount: amountVal,
      formattedAmount: `₹${amountVal.toLocaleString('en-IN')}`,
      date: new Date().toISOString().split('T')[0],
      vendor: data.vendor || 'Vendor Partner',
      status: 'pending_approval',
      requestedBy: 'Pradumn Saindane',
    };

    setExpenses(prev => [newExp, ...prev]);
    addToast({
      type: 'success',
      title: 'Expense Submitted',
      description: `${newExp.title} submitted to approval queue.`,
    });
  };

  const createTask = (data: Partial<Task>) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: data.title || 'Follow up on business milestone',
      description: data.description || 'Execution task linked to company growth.',
      priority: data.priority || 'high',
      status: 'todo',
      dueDate: data.dueDate || 'Today',
      assignedTo: data.assignedTo || 'Pradumn Saindane',
      customerId: data.customerId,
      customerName: data.customerName,
      potentialRevenue: data.potentialRevenue,
    };

    setTasks(prev => [newTask, ...prev]);
    addToast({
      type: 'success',
      title: 'Task Created',
      description: `"${newTask.title}" added to your Work Command Center.`,
    });
  };

  const createDeal = (data: Partial<Deal>) => {
    const valueVal = data.value || 250000;
    const newDeal: Deal = {
      id: `deal-${Date.now()}`,
      title: data.title || 'Enterprise Expansion Contract',
      customerId: data.customerId || 'cust-1',
      customerName: data.customerName || 'Acme Ltd',
      value: valueVal,
      formattedValue: `₹${(valueVal / 100000).toFixed(1)}L`,
      stage: data.stage || 'lead',
      probability: 40,
      lastContactDaysAgo: 0,
      isStale: false,
      assignedTo: 'Pradumn Saindane',
      expectedCloseDate: '2026-11-15',
    };

    setDeals(prev => [newDeal, ...prev]);
    addToast({
      type: 'success',
      title: 'Deal Logged',
      description: `Opportunity for ${newDeal.formattedValue} with ${newDeal.customerName} added to pipeline.`,
    });
  };

  // Natural Language fast action parser
  const executeNaturalLanguageAction = (promptText: string): boolean => {
    const text = promptText.toLowerCase();

    // Example 1: "Create an invoice for Acme for ₹50,000"
    if (text.includes('invoice') && text.includes('acme')) {
      const matchAmount = promptText.match(/(?:₹|rs\.?|inr)?\s*([0-9,]+)/i);
      const amount = matchAmount ? parseInt(matchAmount[1].replace(/,/g, ''), 10) : 50000;
      createInvoice({
        customerId: 'cust-1',
        customerName: 'Acme Ltd',
        amount: amount,
        dueDate: '2026-10-31',
      });
      return true;
    }

    // Example 2: "Follow up with Acme"
    if (text.includes('follow up') && text.includes('acme')) {
      const cust = customers.find(c => c.id === 'cust-1');
      if (cust) {
        openAIActionModal({
          title: 'Prepare Follow-Up Email to Acme Ltd',
          level: 4,
          source: 'Natural Language Assistant',
          description: 'AI detected your intent to follow up on the ₹3.2L Enterprise Core System deal.',
          actionDraft: {
            recipient: 'Rohan Verma <r.verma@acmecorp.in>',
            subject: 'Re: Enterprise Core System & Q4 rollout timeline',
            content: `Hi Rohan,\n\nFollowing up on our discussions last week. We have finalized the architecture provisions you requested.\n\nCould we jump on a brief 10-minute sync tomorrow?\n\nBest regards,\nPradumn Saindane`,
            payloadType: 'follow_up_email',
            targetId: cust.id,
            amount: '₹3.2L'
          },
          onExecute: () => {
            addToast({
              type: 'success',
              title: 'Follow-Up Sent',
              description: 'AI message dispatched to Acme executive team.',
            });
          }
        });
        return true;
      }
    }

    // Example 3: "Add expense 18500 marketing"
    if (text.includes('expense')) {
      const matchAmount = promptText.match(/(?:₹|rs\.?|inr)?\s*([0-9,]+)/i);
      const amount = matchAmount ? parseInt(matchAmount[1].replace(/,/g, ''), 10) : 25000;
      createExpense({
        title: 'Natural Language Parsed Expense Claim',
        category: text.includes('market') ? 'Marketing' : 'Operations',
        amount: amount,
        vendor: 'Authorized Vendor',
      });
      return true;
    }

    // Example 4: "Task to call XYZ"
    if (text.includes('task') || text.includes('remind')) {
      createTask({
        title: promptText.replace(/^(create|add|new)\s*task:?/i, '').trim() || 'Urgent Client Followup',
        priority: 'high',
        dueDate: 'Today',
      });
      return true;
    }

    return false;
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
        toggleTodayItemDone,
        advanceDealStage,
        toggleIntegration,
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
