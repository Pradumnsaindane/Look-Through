import { 
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

export const INITIAL_HEALTH_METRICS: HealthMetric[] = [
  {
    id: 'health-revenue',
    domain: 'Finance',
    label: 'Revenue',
    status: 'healthy',
    statusText: '↑ Healthy',
    trend: 'up',
    evidence: {
      primaryValue: '₹4.82L (MTD)',
      detail1: '+12.4% vs last month',
      detail2: 'Target achievement: 96.4%',
      subtext: 'Billed ₹4.82L out of ₹5.00L monthly run-rate target with 8 days remaining.',
    },
    suggestedAction: 'View Revenue Breakdown',
    targetTab: 'finance',
  },
  {
    id: 'health-cash',
    domain: 'Treasury',
    label: 'Cash Flow',
    status: 'stable',
    statusText: '→ Stable',
    trend: 'flat',
    evidence: {
      primaryValue: '₹8.70L Balance',
      detail1: 'Net inflow: +₹1.34L this month',
      detail2: 'Runway: 7.4 months',
      subtext: 'Cash buffer meets liquidity policy (>6 months of median fixed opex).',
    },
    suggestedAction: 'Inspect Runway Projections',
    targetTab: 'finance',
  },
  {
    id: 'health-customers',
    domain: 'CRM',
    label: 'Customers',
    status: 'growing',
    statusText: '↑ Growing',
    trend: 'up',
    evidence: {
      primaryValue: '248 Total Accounts',
      detail1: '+18 net new accounts (MTD)',
      detail2: 'Churn rate: 0.8% (Target < 2.0%)',
      subtext: '82% average account health score across top tier accounts.',
    },
    suggestedAction: 'View Customer Health',
    targetTab: 'customers',
  },
  {
    id: 'health-pipeline',
    domain: 'Sales',
    label: 'Sales Pipeline',
    status: 'attention',
    statusText: '↓ Needs attention',
    trend: 'down',
    evidence: {
      primaryValue: '₹16.5L Pipeline Value',
      detail1: '3 high-value deals stagnant >7 days',
      detail2: 'Weighted forecast: ₹11.2L',
      subtext: 'Acme Ltd (₹3.2L) and GlobalTech (₹2.1L) have had no team touchpoint in 5+ days.',
    },
    suggestedAction: 'Nudge Stagnant Deals',
    targetTab: 'customers',
  },
  {
    id: 'health-expenses',
    domain: 'Cost Control',
    label: 'Expenses',
    status: 'attention',
    statusText: '↑ Increasing',
    trend: 'warning',
    evidence: {
      primaryValue: '₹7.20L Total (MTD)',
      detail1: 'Marketing +31% over budget baseline',
      detail2: '3 pending supervisor approvals',
      subtext: 'Ad spend on paid search accelerated without pre-cleared ROAS verification.',
    },
    suggestedAction: 'Review Pending Approvals',
    targetTab: 'finance',
  },
  {
    id: 'health-receivables',
    domain: 'Working Capital',
    label: 'Receivables',
    status: 'critical',
    statusText: '⚠ Attention (Overdue)',
    trend: 'warning',
    evidence: {
      primaryValue: '₹84,000 Overdue',
      detail1: '4 unpaid invoices past net-30 terms',
      detail2: 'Oldest overdue: 23 days (XYZ Ltd)',
      subtext: 'Total outstanding receivables stand at ₹2.40L, with 35% currently in overdue aging.',
    },
    suggestedAction: 'Launch Payment Chaser',
    targetTab: 'finance',
  },
  {
    id: 'health-operations',
    domain: 'Work & SLA',
    label: 'Operations',
    status: 'normal',
    statusText: '✓ Normal',
    trend: 'up',
    evidence: {
      primaryValue: '94.2% SLA Completion',
      detail1: '14/15 deliverables shipped on time',
      detail2: 'Active client tasks: 12',
      subtext: 'Delivery team velocity stable with 0 critical project blockers.',
    },
    suggestedAction: 'View Work Board',
    targetTab: 'work',
  },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Acme Corporation',
    company: 'Acme Ltd',
    email: 'finance@acmecorp.in',
    phone: '+91 98201 44521',
    revenue: 420000,
    formattedRevenue: '₹4.2L',
    lastActivity: '2 days ago',
    lastActivityDaysAgo: 2,
    status: 'Active',
    healthScore: 82,
    openInvoicesCount: 1,
    openInvoicesAmount: 32000,
    openOpportunitiesCount: 2,
    openOpportunitiesAmount: 320000,
    avatarBg: 'from-blue-600 to-indigo-700',
    tags: ['Enterprise', 'High Value', 'Manufacturing'],
    industry: 'Enterprise Software & Manufacturing',
    notes: [
      'Account executive: Rohan Verma.',
      'Contract renewal scheduled for Q4. Looking to expand license seats.',
      'Payment term: Net 30 days. Regular payer with slight delay on last PO #1019.',
    ],
  },
  {
    id: 'cust-2',
    name: 'XYZ Technologies Pvt Ltd',
    company: 'XYZ Ltd',
    email: 'accounts@xyztech.io',
    phone: '+91 98402 11984',
    revenue: 280000,
    formattedRevenue: '₹2.8L',
    lastActivity: '7 days ago',
    lastActivityDaysAgo: 7,
    status: 'Attention',
    healthScore: 58,
    openInvoicesCount: 2,
    openInvoicesAmount: 52000,
    openOpportunitiesCount: 1,
    openOpportunitiesAmount: 180000,
    avatarBg: 'from-amber-600 to-orange-700',
    tags: ['Mid-Market', 'Needs Follow-up', 'SaaS'],
    industry: 'FinTech Infrastructure',
    notes: [
      'Overdue invoice #1015 (₹52,000) unpaid for 23 days.',
      'CFO changed last week; updated billing contact required.',
    ],
  },
  {
    id: 'cust-3',
    name: 'ABC Enterprise Solutions',
    company: 'ABC Pvt Ltd',
    email: 'priya@abcenterprise.com',
    phone: '+91 99110 88234',
    revenue: 140000,
    formattedRevenue: '₹1.4L',
    lastActivity: 'Today',
    lastActivityDaysAgo: 0,
    status: 'Active',
    healthScore: 94,
    openInvoicesCount: 0,
    openInvoicesAmount: 0,
    openOpportunitiesCount: 1,
    openOpportunitiesAmount: 240000,
    avatarBg: 'from-emerald-600 to-teal-700',
    tags: ['Strategic', 'Fast Growing', 'Consulting'],
    industry: 'Management Consulting',
    notes: [
      'Deal moved to Proposal stage today for Enterprise Ops Migration (₹2.4L).',
      'Client meeting confirmed for 2:30 PM today with CTO Vikram Shah.',
    ],
  },
  {
    id: 'cust-4',
    name: 'Solaria Cloud Systems',
    company: 'Solaria Ltd',
    email: 'billing@solariacloud.com',
    phone: '+91 97188 55432',
    revenue: 560000,
    formattedRevenue: '₹5.6L',
    lastActivity: '1 day ago',
    lastActivityDaysAgo: 1,
    status: 'Active',
    healthScore: 91,
    openInvoicesCount: 0,
    openInvoicesAmount: 0,
    openOpportunitiesCount: 1,
    openOpportunitiesAmount: 450000,
    avatarBg: 'from-purple-600 to-pink-700',
    tags: ['Cloud', 'Enterprise', 'Top Client'],
    industry: 'Cloud Infrastructure',
    notes: [
      'Annual retainers fully cleared on time via Stripe automated billing.',
      'Very responsive to product updates.',
    ],
  },
  {
    id: 'cust-5',
    name: 'Vertex Automation Labs',
    company: 'Vertex Labs',
    email: 'contact@vertexlabs.ai',
    phone: '+91 96541 33221',
    revenue: 95000,
    formattedRevenue: '₹95,000',
    lastActivity: '12 days ago',
    lastActivityDaysAgo: 12,
    status: 'At Risk',
    healthScore: 42,
    openInvoicesCount: 1,
    openInvoicesAmount: 18000,
    openOpportunitiesCount: 0,
    openOpportunitiesAmount: 0,
    avatarBg: 'from-rose-600 to-red-700',
    tags: ['At Risk', 'Low Usage'],
    industry: 'Robotics & AI',
    notes: [
      'No logins recorded in client portal over past 14 days.',
      'Primary stakeholder on sabbatical.',
    ],
  },
  {
    id: 'cust-6',
    name: 'Nexa Infotech Global',
    company: 'Nexa Corp',
    email: 'operations@nexaglobal.com',
    phone: '+91 98877 66554',
    revenue: 310000,
    formattedRevenue: '₹3.1L',
    lastActivity: '4 days ago',
    lastActivityDaysAgo: 4,
    status: 'Active',
    healthScore: 88,
    openInvoicesCount: 0,
    openInvoicesAmount: 0,
    openOpportunitiesCount: 1,
    openOpportunitiesAmount: 190000,
    avatarBg: 'from-cyan-600 to-blue-700',
    tags: ['Technology', 'Retainer'],
    industry: 'Digital Transformation',
    notes: ['Quarterly performance review delivered with positive CSAT.'],
  }
];

export const INITIAL_DEALS: Deal[] = [
  {
    id: 'deal-1',
    title: 'Enterprise Core System Implementation',
    customerId: 'cust-1',
    customerName: 'Acme Ltd',
    value: 320000,
    formattedValue: '₹3.2L',
    stage: 'negotiation',
    probability: 80,
    lastContactDaysAgo: 5,
    isStale: true,
    assignedTo: 'Pradumn Saindane',
    expectedCloseDate: '2026-10-15',
  },
  {
    id: 'deal-2',
    title: 'Cloud Security Audit & Governance Setup',
    customerId: 'cust-4',
    customerName: 'Solaria Cloud Systems',
    value: 450000,
    formattedValue: '₹4.5L',
    stage: 'proposal',
    probability: 65,
    lastContactDaysAgo: 1,
    isStale: false,
    assignedTo: 'Rohan Verma',
    expectedCloseDate: '2026-10-25',
  },
  {
    id: 'deal-3',
    title: 'Enterprise Ops Migration Retainer',
    customerId: 'cust-3',
    customerName: 'ABC Enterprise Solutions',
    value: 240000,
    formattedValue: '₹2.4L',
    stage: 'proposal',
    probability: 70,
    lastContactDaysAgo: 0,
    isStale: false,
    assignedTo: 'Priya Sharma',
    expectedCloseDate: '2026-10-18',
  },
  {
    id: 'deal-4',
    title: 'FinTech Compliance Connector Suite',
    customerId: 'cust-2',
    customerName: 'XYZ Technologies',
    value: 180000,
    formattedValue: '₹1.8L',
    stage: 'qualified',
    probability: 45,
    lastContactDaysAgo: 7,
    isStale: true,
    assignedTo: 'Pradumn Saindane',
    expectedCloseDate: '2026-11-05',
  },
  {
    id: 'deal-5',
    title: 'Digital Workspace Integration Pack',
    customerId: 'cust-6',
    customerName: 'Nexa Infotech',
    value: 190000,
    formattedValue: '₹1.9L',
    stage: 'qualified',
    probability: 50,
    lastContactDaysAgo: 4,
    isStale: false,
    assignedTo: 'Rohan Verma',
    expectedCloseDate: '2026-10-30',
  },
  {
    id: 'deal-6',
    title: 'AI Workflow Pilot for Logistics',
    customerId: 'cust-1',
    customerName: 'Acme Ltd',
    value: 120000,
    formattedValue: '₹1.2L',
    stage: 'lead',
    probability: 25,
    lastContactDaysAgo: 2,
    isStale: false,
    assignedTo: 'Pradumn Saindane',
    expectedCloseDate: '2026-11-20',
  },
  {
    id: 'deal-7',
    title: 'Custom BI Reporting Engine',
    customerId: 'cust-5',
    customerName: 'Vertex Automation Labs',
    value: 120000,
    formattedValue: '₹1.2L',
    stage: 'lead',
    probability: 20,
    lastContactDaysAgo: 12,
    isStale: true,
    assignedTo: 'Priya Sharma',
    expectedCloseDate: '2026-11-30',
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-1024',
    invoiceNumber: '#1024',
    customerId: 'cust-1',
    customerName: 'Acme Ltd',
    amount: 48000,
    formattedAmount: '₹48,000',
    issueDate: '2026-09-15',
    dueDate: '2026-10-01',
    status: 'paid',
    items: [
      { description: 'Business OS Annual Seat Tier - 10 Users', quantity: 1, rate: 40000, total: 40000 },
      { description: 'Custom Analytics Addon', quantity: 1, rate: 8000, total: 8000 }
    ]
  },
  {
    id: 'inv-1019',
    invoiceNumber: '#1019',
    customerId: 'cust-1',
    customerName: 'Acme Ltd',
    amount: 32000,
    formattedAmount: '₹32,000',
    issueDate: '2026-09-02',
    dueDate: '2026-09-20',
    status: 'overdue',
    daysOverdue: 12,
    items: [
      { description: 'Custom API Gateway Integration & Webhook Sync', quantity: 1, rate: 32000, total: 32000 }
    ]
  },
  {
    id: 'inv-1015',
    invoiceNumber: '#1015',
    customerId: 'cust-2',
    customerName: 'XYZ Technologies',
    amount: 52000,
    formattedAmount: '₹52,000',
    issueDate: '2026-08-20',
    dueDate: '2026-09-09',
    status: 'overdue',
    daysOverdue: 23,
    items: [
      { description: 'Quarterly Infrastructure Maintenance & Telemetry', quantity: 1, rate: 52000, total: 52000 }
    ]
  },
  {
    id: 'inv-1025',
    invoiceNumber: '#1025',
    customerId: 'cust-3',
    customerName: 'ABC Enterprise Solutions',
    amount: 140000,
    formattedAmount: '₹1.4L',
    issueDate: '2026-09-28',
    dueDate: '2026-10-15',
    status: 'pending',
    items: [
      { description: 'Digital Transformation Architecture Blueprint', quantity: 1, rate: 140000, total: 140000 }
    ]
  },
  {
    id: 'inv-1026',
    invoiceNumber: '#1026',
    customerId: 'cust-4',
    customerName: 'Solaria Cloud Systems',
    amount: 210000,
    formattedAmount: '₹2.1L',
    issueDate: '2026-09-25',
    dueDate: '2026-10-10',
    status: 'pending',
    items: [
      { description: 'Dedicated Multi-Cloud Orchestration License (Q3)', quantity: 1, rate: 210000, total: 210000 }
    ]
  }
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    title: 'Google Ads & LinkedIn B2B Acquisition Campaign',
    category: 'Marketing',
    amount: 145000,
    formattedAmount: '₹1,45,000',
    date: '2026-10-01',
    vendor: 'Google India / LinkedIn',
    status: 'pending_approval',
    requestedBy: 'Kunal Deshmukh (Growth Lead)',
    isAnomaly: true,
    anomalyNote: 'Marketing spend is 31% higher than 30-day trailing baseline.'
  },
  {
    id: 'exp-2',
    title: 'AWS Production & Database Hosting Cluster',
    category: 'Infrastructure',
    amount: 48500,
    formattedAmount: '₹48,500',
    date: '2026-10-02',
    vendor: 'Amazon Web Services',
    status: 'approved',
    requestedBy: 'System Auto-Billing',
  },
  {
    id: 'exp-3',
    title: 'Client Hospitality & Strategy Workshop Dinner',
    category: 'Operations',
    amount: 18500,
    formattedAmount: '₹18,500',
    date: '2026-10-01',
    vendor: 'The Taj Gateway Hotel',
    status: 'pending_approval',
    requestedBy: 'Rohan Verma (Sales Director)',
  },
  {
    id: 'exp-4',
    title: 'GitHub Enterprise & Notion Team Workspace Renewals',
    category: 'Software & Subscriptions',
    amount: 24000,
    formattedAmount: '₹24,000',
    date: '2026-09-29',
    vendor: 'GitHub & Notion Labs',
    status: 'pending_approval',
    requestedBy: 'Pradumn Saindane',
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Send Acme invoice reminder & payment schedule',
    description: 'Invoice #1019 is 12 days overdue. Share payment link with revised RTGS details.',
    priority: 'critical',
    status: 'todo',
    dueDate: 'Today',
    assignedTo: 'Pradumn Saindane',
    customerId: 'cust-1',
    customerName: 'Acme Ltd',
    dealId: 'deal-1',
    dealTitle: 'Enterprise Core System',
    invoiceId: 'inv-1019',
    invoiceNumber: '#1019',
    potentialRevenue: '₹32,000'
  },
  {
    id: 'task-2',
    title: 'Follow up with XYZ Technologies on overdue ₹52k & billing contact change',
    description: 'Call new accounts manager to re-issue invoice #1015.',
    priority: 'high',
    status: 'todo',
    dueDate: 'Today',
    assignedTo: 'Pradumn Saindane',
    customerId: 'cust-2',
    customerName: 'XYZ Ltd',
    dealId: 'deal-4',
    dealTitle: 'FinTech Compliance Connector',
    invoiceId: 'inv-1015',
    invoiceNumber: '#1015',
    potentialRevenue: '₹52,000'
  },
  {
    id: 'task-3',
    title: 'Prepare executive briefing for ABC Enterprise 2:30 PM meeting',
    description: 'Assemble proposal presentation deck, SLA terms, and security compliance sheet.',
    priority: 'high',
    status: 'todo',
    dueDate: 'Today · 2:30 PM',
    assignedTo: 'Pradumn Saindane',
    customerId: 'cust-3',
    customerName: 'ABC Pvt Ltd',
    dealId: 'deal-3',
    dealTitle: 'Enterprise Ops Migration Retainer',
    potentialRevenue: '₹2.4L'
  },
  {
    id: 'task-4',
    title: 'Review and approve October growth marketing budget and campaign parameters',
    description: 'Evaluate ROI projections for ₹1.45L ad spend request.',
    priority: 'high',
    status: 'todo',
    dueDate: 'Today',
    assignedTo: 'Pradumn Saindane',
    potentialRevenue: '₹1.45L cost approval'
  },
  {
    id: 'task-5',
    title: 'Finalize Solaria Cloud expansion proposal',
    description: 'Add Multi-Cloud High Availability module to contract draft.',
    priority: 'medium',
    status: 'in_progress',
    dueDate: 'Tomorrow',
    assignedTo: 'Rohan Verma',
    customerId: 'cust-4',
    customerName: 'Solaria Cloud Systems',
    dealId: 'deal-2',
    dealTitle: 'Cloud Security Audit',
    potentialRevenue: '₹4.5L'
  },
  {
    id: 'task-6',
    title: 'Sync quarterly audit logs for ISO27001 readiness',
    description: 'Ensure all integration API keys and access tokens are rotated.',
    priority: 'low',
    status: 'todo',
    dueDate: 'In 3 days',
    assignedTo: 'DevOps Team',
  }
];

export const INITIAL_TODAY_ITEMS: OperationalTodayItem[] = [
  {
    id: 'today-1',
    category: 'Critical',
    title: '₹84,000 invoices are overdue',
    subtitle: '4 accounts affected · Oldest is 23 days (XYZ Ltd ₹52k & Acme Ltd ₹32k)',
    actionText: 'Review Invoices',
    badgeText: 'Action Required',
    badgeColor: 'rose',
    actionPayload: {
      type: 'review_invoices',
      details: 'Overdue receivables total ₹84,000 across 4 client invoices.'
    }
  },
  {
    id: 'today-2',
    category: 'High Priority',
    title: "Acme hasn't been contacted for 5 days",
    subtitle: 'High-value deal in Negotiation: ₹3.2L Enterprise Core System',
    actionText: 'Follow Up',
    badgeText: 'Stale Deal',
    badgeColor: 'amber',
    actionPayload: {
      type: 'follow_up_customer',
      targetId: 'cust-1',
      details: 'Draft AI follow-up message to Rohan Verma (Acme Ltd) regarding contract terms.'
    }
  },
  {
    id: 'today-3',
    category: 'Upcoming',
    title: 'Client Strategy Meeting — 2:30 PM',
    subtitle: 'ABC Enterprise Solutions · Vikram Shah (CTO) · ₹2.4L Proposal Discussion',
    actionText: 'Prepare Briefing',
    badgeText: 'Calendar Sync',
    badgeColor: 'blue',
    actionPayload: {
      type: 'meeting_prep',
      targetId: 'cust-3',
      details: 'Review generated AI executive summary & past interactions for ABC Enterprise.'
    }
  },
  {
    id: 'today-4',
    category: 'Decision',
    title: '3 expenses require your approval',
    subtitle: 'Total ₹1.87L · Includes ₹1.45L marketing budget request (31% anomaly)',
    actionText: 'Review & Approve',
    badgeText: 'Approval Queue',
    badgeColor: 'purple',
    actionPayload: {
      type: 'review_expenses',
      details: '3 submitted claims waiting for owner sign-off.'
    }
  }
];

export const INITIAL_ACTIVITY_EVENTS: ActivityEvent[] = [
  {
    id: 'act-1',
    timestamp: '2026-10-02T10:42:00',
    timeLabel: '10:42 AM',
    title: 'Invoice #1024 paid',
    entityName: 'Acme Ltd · ₹48,000',
    amount: '₹48,000',
    category: 'finance',
    iconType: 'invoice',
    severity: 'success'
  },
  {
    id: 'act-2',
    timestamp: '2026-10-02T09:31:00',
    timeLabel: '09:31 AM',
    title: 'New customer created',
    entityName: 'XYZ Technologies Pvt Ltd',
    category: 'customers',
    iconType: 'customer',
    severity: 'normal'
  },
  {
    id: 'act-3',
    timestamp: '2026-10-01T16:20:00',
    timeLabel: 'Yesterday 4:20 PM',
    title: 'Deal moved to Proposal stage',
    entityName: 'ABC Enterprise · ₹2.4L',
    amount: '₹2.4L',
    category: 'sales',
    iconType: 'deal',
    severity: 'success'
  },
  {
    id: 'act-4',
    timestamp: '2026-10-01T14:15:00',
    timeLabel: 'Yesterday 2:15 PM',
    title: 'Expense approved',
    entityName: 'Infrastructure · ₹48,500 AWS Cluster',
    amount: '₹48,500',
    category: 'finance',
    iconType: 'expense',
    severity: 'normal'
  },
  {
    id: 'act-5',
    timestamp: '2026-10-01T11:00:00',
    timeLabel: 'Yesterday 11:00 AM',
    title: 'AI Insight Generated',
    entityName: 'Receivables increasing by 24% over 30d window',
    category: 'system',
    iconType: 'alert',
    severity: 'warning'
  },
  {
    id: 'act-6',
    timestamp: '2026-09-30T17:40:00',
    timeLabel: '2 days ago',
    title: 'Contract draft sent',
    entityName: 'Solaria Cloud Systems · ₹4.5L',
    amount: '₹4.5L',
    category: 'sales',
    iconType: 'deal',
    severity: 'normal'
  }
];

export const INITIAL_AI_INSIGHTS: AIInsight[] = [
  {
    id: 'insight-1',
    type: 'receivables',
    severity: 'warning',
    title: 'Receivables increasing',
    summary: 'Your overdue invoices increased 24% over the last 30 days.',
    whyItMatters: '₹84,000 is currently overdue. Average Days Sales Outstanding (DSO) lengthened from 18 to 27 days, tying up working capital needed for payroll.',
    suggestedAction: 'Dispatch automated polite payment reminder sequence to XYZ Ltd & Acme Ltd.',
    actionButtonText: 'Review Overdue Invoices',
    metricsHighlight: '₹84,000 Overdue · 4 Accounts',
    actionPayload: {
      type: 'review_invoices',
      suggestedContent: 'Dear Accounts Team, gentle reminder regarding Invoice #1019 & #1015. Please find the direct payment link attached.'
    }
  },
  {
    id: 'insight-2',
    type: 'sales',
    severity: 'opportunity',
    title: 'High-Value Sales Opportunity Acceleration',
    summary: "Acme's activity increased significantly over the past two weeks.",
    whyItMatters: 'Open opportunity value is ₹3.2L. 4 stakeholders viewed the security whitepaper in 48 hours. Closing before month-end boosts Q4 target by 18%.',
    suggestedAction: 'Reach out to Rohan Verma with the final enterprise agreement proposal.',
    actionButtonText: 'Prepare Follow-Up Email',
    metricsHighlight: '₹3.2L Pipeline Value · 80% Win Prob',
    actionPayload: {
      type: 'follow_up_email',
      targetId: 'cust-1',
      targetName: 'Acme Ltd',
      amount: '₹3,20,000',
      suggestedContent: 'Hi Rohan,\n\nI noticed your team was reviewing our architecture blueprint. Let me know if you would like a brief 15-min sync to lock in the Q4 license terms.\n\nBest,\nPradumn'
    }
  },
  {
    id: 'insight-3',
    type: 'anomaly',
    severity: 'anomaly',
    title: 'Marketing Expense Anomaly Detected',
    summary: 'Marketing expenses are 31% above the previous monthly average.',
    whyItMatters: '₹1.45L requested for Google/LinkedIn ads vs ₹1.10L historical baseline without linked conversion tracking updates.',
    suggestedAction: 'Require campaign ROAS metrics before approving claim #exp-1.',
    actionButtonText: 'Investigate Expense',
    metricsHighlight: '+31% Budget Variance',
    actionPayload: {
      type: 'investigate_expense',
      targetId: 'exp-1',
      amount: '₹1,45,000'
    }
  },
  {
    id: 'insight-4',
    type: 'runway',
    severity: 'info',
    title: 'Healthy Treasury Buffer Projection',
    summary: 'Cash runway comfortably extends to 7.4 months based on current burn rate.',
    whyItMatters: 'With ₹8.7L in liquid bank reserves and ₹5.2L monthly net income, business health is primed for strategic talent acquisition.',
    suggestedAction: 'Review cash flow forecast model and planned capital allocation.',
    actionButtonText: 'View Cash Flow Model',
    metricsHighlight: '7.4 Months Runway',
    actionPayload: {
      type: 'view_deal'
    }
  }
];

export const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'alert-1',
    severity: 'critical',
    category: 'Financial',
    title: 'Payment gateway recurring charge failed',
    whatHappened: 'Stripe webhook reported failed auto-debit of ₹18,000 for Vertex Labs.',
    whyItMatters: 'Subscription service could suspend within 48h, risking customer churn.',
    whatCanIDo: 'Trigger automated retry card notification email to billing@vertexlabs.ai.',
    actionButtonText: 'Send Update Payment Card Request',
    timestamp: '15 mins ago',
    isRead: false,
  },
  {
    id: 'alert-2',
    severity: 'attention',
    category: 'Financial',
    title: '₹84,000 in Overdue Invoices',
    whatHappened: '4 customer invoices have surpassed Net-30 payment deadlines.',
    whyItMatters: 'Working capital is impacted; receivables represent 28% of monthly cash inflow.',
    whatCanIDo: 'Dispatch AI-crafted payment reminders with instant UPI/Stripe links.',
    actionButtonText: 'Dispatch Payment Reminders',
    timestamp: '1 hour ago',
    isRead: false,
  },
  {
    id: 'alert-3',
    severity: 'warning',
    category: 'Operations',
    title: 'Marketing expenses accelerating',
    whatHappened: 'Ad budget claims reached ₹1.45L (+31% vs prior month).',
    whyItMatters: 'May decrease net profit margin from 42% to 35% if unmonitored.',
    whatCanIDo: 'Review ROAS metrics in the finance approval center.',
    actionButtonText: 'Review Marketing Spend',
    timestamp: '3 hours ago',
    isRead: false,
  },
  {
    id: 'alert-4',
    severity: 'info',
    category: 'Customer',
    title: 'New customer account initialized',
    whatHappened: 'XYZ Technologies completed their initial onboarding questionnaire.',
    whyItMatters: 'Account is ready for the compliance connector kickoff workflow.',
    whatCanIDo: 'Assign dedicated onboarding account manager.',
    actionButtonText: 'Assign Account Lead',
    timestamp: '5 hours ago',
    isRead: true,
  }
];

export const INITIAL_INTEGRATIONS: IntegrationService[] = [
  {
    id: 'int-gcal',
    name: 'Google Calendar',
    category: 'Email & Cal',
    status: 'connected',
    lastSynced: '2 mins ago',
    iconName: 'calendar',
    description: 'Syncs executive schedule, client demos, and operational milestones in real time.',
    features: ['Real-time meeting sync', 'Auto meeting prep briefs', 'Calendar conflict checks']
  },
  {
    id: 'int-gmail',
    name: 'Gmail / Google Workspace',
    category: 'Email & Cal',
    status: 'connected',
    lastSynced: 'Just now',
    iconName: 'mail',
    description: 'Tracks customer communication threads, detects sentiment, and prepares follow-ups.',
    features: ['Thread parsing', 'Sentiment analysis', 'Draft AI responses']
  },
  {
    id: 'int-stripe',
    name: 'Stripe Payments',
    category: 'Payment',
    status: 'connected',
    lastSynced: '1 min ago',
    iconName: 'credit-card',
    description: 'Processes global multi-currency subscriptions, auto-generates invoice receipts.',
    features: ['Instant webhooks', 'Failed charge alerts', 'Auto reconciliation']
  },
  {
    id: 'int-razorpay',
    name: 'Razorpay & UPI',
    category: 'Payment',
    status: 'connected',
    lastSynced: '5 mins ago',
    iconName: 'wallet',
    description: 'Domestic Indian payments, GST e-invoices, and automated UPI payment links.',
    features: ['UPI deep-linking', 'GST tax validation', 'Instant payout tracking']
  },
  {
    id: 'int-banking',
    name: 'HDFC / ICICI Open Banking API',
    category: 'Banking',
    status: 'connected',
    lastSynced: '10 mins ago',
    iconName: 'landmark',
    description: 'Live bank feed sync for cash balance, RTGS reconciliation, and treasury monitoring.',
    features: ['Real-time balance feeds', 'Transaction deduplication', 'Automatic categorization']
  },
  {
    id: 'int-zoho',
    name: 'Zoho Books / CRM',
    category: 'Accounting',
    status: 'available',
    iconName: 'book-open',
    description: 'Bi-directional synchronization of ledger accounts, journals, and sales pipelines.',
    features: ['Ledger sync', 'Double-entry audit trail', 'Vendor database sync']
  },
  {
    id: 'int-quickbooks',
    name: 'QuickBooks Online',
    category: 'Accounting',
    status: 'available',
    iconName: 'file-text',
    description: 'Connect enterprise chart of accounts, tax compliance schedules, and payroll.',
    features: ['Tax calculation', 'P&L mapping', 'Balance sheet sync']
  },
  {
    id: 'int-slack',
    name: 'Slack Notification Bot',
    category: 'Communication',
    status: 'connected',
    lastSynced: 'Live',
    iconName: 'message-square',
    description: 'Pushes high-priority alerts and AI action approval cards directly to Slack channels.',
    features: ['Interactive approval buttons', 'Daily morning briefing', 'Incident alerts']
  },
  {
    id: 'int-whatsapp',
    name: 'WhatsApp Business API',
    category: 'Communication',
    status: 'available',
    iconName: 'phone',
    description: 'Sends automated payment reminder links and delivery updates directly to clients.',
    features: ['Instant payment links', 'Customer support bot', 'Template message routing']
  }
];

export const MONTHLY_FINANCIAL_CHART_DATA = [
  { month: 'Jan', revenue: 8.2, expenses: 5.1, netProfit: 3.1, cash: 6.4 },
  { month: 'Feb', revenue: 9.4, expenses: 5.6, netProfit: 3.8, cash: 7.1 },
  { month: 'Mar', revenue: 10.1, expenses: 6.2, netProfit: 3.9, cash: 7.5 },
  { month: 'Apr', revenue: 11.0, expenses: 6.8, netProfit: 4.2, cash: 7.9 },
  { month: 'May', revenue: 11.8, expenses: 6.9, netProfit: 4.9, cash: 8.3 },
  { month: 'Jun', revenue: 12.4, expenses: 7.2, netProfit: 5.2, cash: 8.7 },
];

export const RECEIVABLES_AGING_DATA = [
  { bucket: 'Current (0-15d)', amount: 124000, count: 6, color: '#10b981' },
  { bucket: '16-30 Days', amount: 32000, count: 2, color: '#3b82f6' },
  { bucket: '31-60 Days', amount: 52000, count: 2, color: '#f59e0b' },
  { bucket: '60+ Days Overdue', amount: 32000, count: 2, color: '#ef4444' },
];

export const PIPELINE_STAGE_METRICS = {
  lead: { count: 8, totalValue: 240000, formattedValue: '₹2.4L' },
  qualified: { count: 6, totalValue: 410000, formattedValue: '₹4.1L' },
  proposal: { count: 4, totalValue: 680000, formattedValue: '₹6.8L' },
  negotiation: { count: 2, totalValue: 320000, formattedValue: '₹3.2L' },
  won: { count: 14, totalValue: 1840000, formattedValue: '₹18.4L' }
};
