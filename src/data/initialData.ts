import { AppSettings, DocumentItem, OrgKnowledgeItem, Project, ReportItem, Task } from '../types';

export const initialSettings: AppSettings = {
  orgProfile: {
    name: 'Apex Global Enterprises',
    tagline: 'Leading enterprise solutions and global supply systems',
    industry: 'Enterprise Software & Supply Operations',
    description: 'A multi-regional technology and logistics organisation operating in North America, Europe, and Asia-Pacific with 1,200+ employees.',
    founded: '2018',
    headquarters: 'London / San Francisco',
  },
  currency: 'USD ($)',
  dateFormat: 'YYYY-MM-DD',
  theme: 'light',
};

export const initialDocuments: DocumentItem[] = [
  {
    id: 'doc_1',
    name: 'Q3 Operations Review & Supply Chain Strategy.docx',
    type: 'docx',
    uploadDate: '2026-10-24',
    fileSize: '48.5 KB',
    isDemo: true,
    content: `APEX GLOBAL ENTERPRISES — QUARTERLY OPERATIONAL REVIEW (Q3)

1. EXECUTIVE SUMMARY
Operating margin increased by 4.2% year-on-year, driven by automation in order processing. However, supply chain fulfillment delays in the Central European hub continue to represent our primary delivery bottleneck, with average transit turnaround times extending to 6.8 days against our target SLA of 4.0 days.

2. LOGISTICS AND FULFILLMENT
- North American distribution centers achieved a 98.4% on-time fulfillment rate.
- European logistics vendor contract with TransLog GmbH expires on November 15, 2026. Renegotiation or replacement is critical.
- Action Required: Procurement must finalize alternative supplier proposals by November 10, 2026.
- Inventory holding costs rose by 8% due to buffer stocking in Rotterdam.

3. WORKFORCE & CAPACITY
- Warehouse staffing is at 92% capacity. Seasonal hiring for Q4 peak requires 45 temporary personnel onboarded before November 20.
- Facility automation trial in Frankfurt demonstrated a 30% reduction in sorting errors.

4. ACTION ITEMS & DIRECTIVES
- Marcus Vance: Complete vendor evaluation for TransLog replacement by November 10.
- Elena Rostova: Submit warehouse peak staffing budget to Finance for sign-off by November 8.
- Operations Committee: Convene bi-weekly sync to monitor SLA recovery plan.`,
    summary: 'Q3 operations showed a 4.2% margin increase, but European fulfillment delays represent a significant bottleneck. Urgent action required on the expiring TransLog logistics contract and Q4 peak warehouse hiring.',
    keyPoints: [
      'Operating margin improved by 4.2% YoY.',
      'Central European transit turnaround is 6.8 days vs 4.0 day target SLA.',
      'TransLog contract expires on November 15, 2026.',
      'Seasonal warehouse hiring needed: 45 personnel by November 20.',
    ],
    extractedTasks: [
      {
        title: 'Evaluate replacement suppliers for TransLog contract',
        description: 'Complete vendor proposals and cost analysis before contract expiration on Nov 15.',
        priority: 'Urgent',
        dueDate: '2026-11-10',
        assignee: 'Marcus Vance',
      },
      {
        title: 'Submit Q4 warehouse peak staffing budget',
        description: 'Prepare financial request for 45 temporary warehouse personnel to Finance.',
        priority: 'High',
        dueDate: '2026-11-08',
        assignee: 'Elena Rostova',
      },
    ],
    risks: [
      'Contract lapse with European logistics provider on Nov 15 could stall regional deliveries.',
      'Shortage of peak seasonal labor risking Q4 order fulfillment spikes.',
    ],
    recommendations: [
      'Accelerate TransLog tender process with 3 pre-vetted alternatives.',
      'Authorize expedited hiring bonuses for early shift warehouse personnel.',
    ],
  },
  {
    id: 'doc_2',
    name: 'Executive Committee Meeting Minutes - Oct 2026.txt',
    type: 'txt',
    uploadDate: '2026-10-28',
    fileSize: '12.2 KB',
    isDemo: true,
    content: `EXECUTIVE COMMITTEE MEETING MINUTES
Date: October 28, 2026
Attendees: Sarah Lin (COO), David Sterling (CEO), Rachel Zhang (CTO), Marcus Vance (VP Procurement), Liam O'Connor (CFO)

AGENDA ITEMS DISCUSSED:
1. PROJECT NEXUS STATUS:
Rachel reported that Project Nexus core API architecture is 65% complete. However, cloud infrastructure migration has encountered database latency challenges. Target public release date remains December 15, 2026.
Directive: Rachel to conduct load testing and deliver performance benchmark report by November 12.

2. ISO 27001 AUDIT DEADLINE:
David emphasized the importance of the external ISO 27001 surveillance audit on November 25. Three open non-conformities remain regarding internal multi-factor authentication enforcement and third-party vendor risk assessments.
Directive: Marcus and Security team must close vendor risk assessments by November 14.

3. BUDGET & FISCAL ALLOCATION:
Liam presented the revised Q4 forecast. Approved additional $120,000 discretionary budget for Project Nexus performance optimization and automated testing tooling.

DECISIONS RECORDED:
- Approved $120k budget adjustment for Project Nexus engineering tooling.
- Mandatory compliance freeze starting November 20 ahead of ISO audit.
- Next executive meeting scheduled for November 12.`,
    summary: 'Executive committee reviewed Project Nexus (65% done, API latency under investigation), set strict deadlines for ISO 27001 vendor risk closures by Nov 14, and approved $120k tooling budget.',
    keyPoints: [
      'Project Nexus is 65% complete with Dec 15 launch target; performance benchmarks due Nov 12.',
      'ISO 27001 external audit is Nov 25; vendor risk assessments must close by Nov 14.',
      'Approved $120k budget adjustment for engineering tooling.',
      'Mandatory compliance freeze takes effect on Nov 20.',
    ],
    extractedTasks: [
      {
        title: 'Conduct Project Nexus load tests and deliver benchmarks',
        description: 'Verify database latency resolution and submit benchmark report.',
        priority: 'High',
        dueDate: '2026-11-12',
        assignee: 'Rachel Zhang',
      },
      {
        title: 'Close 3 open ISO 27001 vendor risk assessments',
        description: 'Ensure third-party vendor audits meet surveillance auditor standards.',
        priority: 'Urgent',
        dueDate: '2026-11-14',
        assignee: 'Marcus Vance',
      },
    ],
    risks: [
      'Database latency in Project Nexus could delay December 15 public rollout.',
      'Failure to close vendor risk assessments before Nov 20 compliance freeze.',
    ],
    recommendations: [
      'Engage specialized database performance consultant for immediate tuning.',
      'Hold daily 15-minute standups on ISO 27001 remediation checklist.',
    ],
  },
  {
    id: 'doc_3',
    name: 'Data Security & Compliance Policy 2026.pdf',
    type: 'pdf',
    uploadDate: '2026-10-15',
    fileSize: '84.0 KB',
    isDemo: true,
    content: `DATA SECURITY AND INFORMATION GOVERNANCE POLICY — VERSION 4.2
Apex Global Enterprises

1. PRINCIPLES:
All customer and corporate operational data must be encrypted at rest using AES-256 and in transit using TLS 1.3.

2. ACCESS CONTROLS:
- Role-Based Access Control (RBAC) must be enforced across all cloud services and internal portals.
- Multi-factor authentication (MFA) via hardware security keys or authenticator apps is mandatory for all employees. SMS-based 2FA is prohibited.
- Access rights must be revoked within 24 hours of employee departure.

3. INCIDENT RESPONSE:
Any suspected data breach or security anomaly must be reported to security@apexglobal.internal within 60 minutes of detection. Mandatory annual compliance refresher training must be completed by November 30 by 100% of staff.`,
    summary: 'Corporate security policy mandating AES-256 / TLS 1.3 encryption, hardware/authenticator app MFA, 60-minute incident reporting SLA, and 100% staff compliance training completion by Nov 30.',
    keyPoints: [
      'AES-256 encryption at rest, TLS 1.3 in transit.',
      'MFA mandatory via authenticator/hardware keys; SMS prohibited.',
      '60-minute incident reporting requirement.',
      'Annual training must be completed by Nov 30.',
    ],
    extractedTasks: [
      {
        title: 'Track employee annual security compliance training completion',
        description: 'Audit training portal to ensure all 1,200 employees complete modules before Nov 30.',
        priority: 'Medium',
        dueDate: '2026-11-30',
        assignee: 'Security & HR Operations',
      },
    ],
    risks: ['Employee training lag could jeopardize ISO 27001 audit score.'],
    recommendations: ['Send automated weekly reminders to employees with pending modules.'],
  },
];

export const initialTasks: Task[] = [
  {
    id: 'task_1',
    title: 'Evaluate replacement suppliers for TransLog contract',
    description: 'Complete vendor proposals and cost analysis before European logistics contract expires on Nov 15.',
    priority: 'Urgent',
    dueDate: '2026-11-10',
    status: 'In Progress',
    projectId: 'proj_3',
    documentId: 'doc_1',
    assignee: 'Marcus Vance',
    isDemo: true,
    createdAt: '2026-10-25',
  },
  {
    id: 'task_2',
    title: 'Close 3 open ISO 27001 vendor risk assessments',
    description: 'Resolve outstanding security questionnaires and vendor compliance sheets for external auditor review.',
    priority: 'Urgent',
    dueDate: '2026-11-14',
    status: 'To Do',
    projectId: 'proj_2',
    documentId: 'doc_2',
    assignee: 'Marcus Vance',
    isDemo: true,
    createdAt: '2026-10-28',
  },
  {
    id: 'task_3',
    title: 'Submit Q4 warehouse peak staffing budget',
    description: 'Finalize financial sign-off for 45 temporary warehouse personnel to prevent seasonal backlog.',
    priority: 'High',
    dueDate: '2026-11-08',
    status: 'To Do',
    projectId: 'proj_3',
    documentId: 'doc_1',
    assignee: 'Elena Rostova',
    isDemo: true,
    createdAt: '2026-10-25',
  },
  {
    id: 'task_4',
    title: 'Conduct Project Nexus load tests & benchmarks',
    description: 'Diagnose database API latency and verify throughput meets 5,000 req/sec benchmark.',
    priority: 'High',
    dueDate: '2026-11-12',
    status: 'In Progress',
    projectId: 'proj_1',
    documentId: 'doc_2',
    assignee: 'Rachel Zhang',
    isDemo: true,
    createdAt: '2026-10-28',
  },
  {
    id: 'task_5',
    title: 'Finalize Q3 Operating Margin audit report',
    description: 'Consolidate regional finance figures and reconcile with corporate ledger.',
    priority: 'Medium',
    dueDate: '2026-10-31',
    status: 'Overdue',
    projectId: 'proj_3',
    assignee: 'Liam O\'Connor',
    isDemo: true,
    createdAt: '2026-10-20',
  },
  {
    id: 'task_6',
    title: 'Deploy MFA hardware token distribution system',
    description: 'Ensure all critical infrastructure engineers have registered YubiKeys for data center access.',
    priority: 'High',
    dueDate: '2026-11-05',
    status: 'Completed',
    projectId: 'proj_2',
    documentId: 'doc_3',
    assignee: 'Security Team',
    isDemo: true,
    createdAt: '2026-10-16',
  },
  {
    id: 'task_7',
    title: 'Publish updated internal incident response runbooks',
    description: 'Update escalation chain and 60-minute containment protocol documentation.',
    priority: 'Medium',
    dueDate: '2026-11-18',
    status: 'To Do',
    projectId: 'proj_2',
    documentId: 'doc_3',
    assignee: 'DevOps & Security',
    isDemo: true,
    createdAt: '2026-10-22',
  },
  {
    id: 'task_8',
    title: 'Track employee annual security compliance training',
    description: 'Monitor learning management system to ensure 100% employee completion prior to Nov 30 deadline.',
    priority: 'Low',
    dueDate: '2026-11-30',
    status: 'In Progress',
    projectId: 'proj_2',
    documentId: 'doc_3',
    assignee: 'HR Operations',
    isDemo: true,
    createdAt: '2026-10-20',
  },
];

export const initialProjects: Project[] = [
  {
    id: 'proj_1',
    name: 'Project Nexus: Enterprise Platform Expansion',
    description: 'Next-generation microservices architecture and client analytics engine enabling high-throughput multi-tenant deployments.',
    department: 'Engineering & Product',
    startDate: '2026-08-01',
    targetEndDate: '2026-12-15',
    status: 'Active',
    budget: '$450,000',
    isDemo: true,
    createdAt: '2026-08-01',
    milestones: [
      { id: 'm1_1', title: 'Architecture design & microservice blueprint', dueDate: '2026-08-30', completed: true },
      { id: 'm1_2', title: 'Core API gateway & authentication cluster', dueDate: '2026-09-30', completed: true },
      { id: 'm1_3', title: 'Database sharding & latency optimization', dueDate: '2026-11-12', completed: false },
      { id: 'm1_4', title: 'End-to-end integration & stress testing', dueDate: '2026-11-28', completed: false },
      { id: 'm1_5', title: 'Global general availability deployment', dueDate: '2026-12-15', completed: false },
    ],
  },
  {
    id: 'proj_2',
    name: 'ISO 27001 Security & Governance Certification',
    description: 'Corporate-wide audit preparation, access control hardening, and external compliance accreditation.',
    department: 'Security & Compliance',
    startDate: '2026-07-15',
    targetEndDate: '2026-11-25',
    status: 'Active',
    budget: '$180,000',
    isDemo: true,
    createdAt: '2026-07-15',
    milestones: [
      { id: 'm2_1', title: 'Internal policy overhaul & documentation', dueDate: '2026-08-15', completed: true },
      { id: 'm2_2', title: 'Hardware MFA rollout for high-privilege users', dueDate: '2026-10-05', completed: true },
      { id: 'm2_3', title: 'Third-party vendor risk assessment closure', dueDate: '2026-11-14', completed: false },
      { id: 'm2_4', title: 'External stage 2 surveillance audit', dueDate: '2026-11-25', completed: false },
    ],
  },
  {
    id: 'proj_3',
    name: 'Q4 Logistics & Vendor Optimization',
    description: 'Renegotiation of European freight agreements and warehouse throughput ramp-up for seasonal demand.',
    department: 'Supply Chain & Operations',
    startDate: '2026-09-01',
    targetEndDate: '2026-12-31',
    status: 'Active',
    budget: '$320,000',
    isDemo: true,
    createdAt: '2026-09-01',
    milestones: [
      { id: 'm3_1', title: 'Rotterdam inventory buffer audit', dueDate: '2026-09-25', completed: true },
      { id: 'm3_2', title: 'TransLog contract tender & supplier selection', dueDate: '2026-11-10', completed: false },
      { id: 'm3_3', title: 'Seasonal warehouse workforce onboarding (45 FTE)', dueDate: '2026-11-20', completed: false },
      { id: 'm3_4', title: 'Peak fulfillment SLA monitoring window', dueDate: '2026-12-31', completed: false },
    ],
  },
  {
    id: 'proj_4',
    name: 'Legacy ERP Modernisation & Cloud Sync',
    description: 'Phased migration of legacy on-premise accounting and order inventory into cloud data warehouse.',
    department: 'Enterprise IT',
    startDate: '2026-11-01',
    targetEndDate: '2027-03-31',
    status: 'Planning',
    budget: '$600,000',
    isDemo: true,
    createdAt: '2026-10-25',
    milestones: [
      { id: 'm4_1', title: 'Data pipeline discovery & schema mapping', dueDate: '2026-11-30', completed: false },
      { id: 'm4_2', title: 'Sandbox replication & validation', dueDate: '2027-01-15', completed: false },
      { id: 'm4_3', title: 'Production cutover and rollback dry run', dueDate: '2027-03-15', completed: false },
    ],
  },
];

export const initialKnowledge: OrgKnowledgeItem[] = [
  {
    id: 'kn_1',
    title: 'Enterprise Overview & Core Mission',
    category: 'Overview',
    content: 'Apex Global Enterprises provides high-availability operational platforms and logistics orchestration for tier-1 enterprises. Our core mission is streamlining cross-border commerce with zero-downtime reliability.',
    updatedAt: '2026-10-15',
    isDemo: true,
  },
  {
    id: 'kn_2',
    title: 'Operational SLA Standards',
    category: 'Policy',
    content: 'All tier-1 client orders must achieve fulfillment dispatch within 4.0 business days. Support ticket response SLA is 15 minutes for P1 critical incidents and 4 hours for standard inquiries.',
    updatedAt: '2026-10-20',
    isDemo: true,
  },
  {
    id: 'kn_3',
    title: 'Procurement & Vendor Evaluation Protocol',
    category: 'Instruction',
    content: 'Any external supplier agreement exceeding $50,000 annually requires minimum 3 competitive bids, legal review, and direct authorization by Marcus Vance (VP Procurement) and Liam O\'Connor (CFO).',
    updatedAt: '2026-10-12',
    isDemo: true,
  },
  {
    id: 'kn_4',
    title: 'Change Management & Release Freezes',
    category: 'Policy',
    content: 'A strict production code and infrastructure freeze is enacted 5 business days prior to external compliance audits (e.g., Nov 20-25 for ISO 27001) and during peak seasonal commercial periods.',
    updatedAt: '2026-10-28',
    isDemo: true,
  },
  {
    id: 'kn_5',
    title: 'Departments & Operational Leads',
    category: 'Department',
    content: 'Operations: Sarah Lin (COO) | Engineering: Rachel Zhang (CTO) | Procurement: Marcus Vance (VP) | Finance: Liam O\'Connor (CFO) | Security: Dr. Aris Thorne (CISO).',
    updatedAt: '2026-10-10',
    isDemo: true,
  },
];

export const initialReports: ReportItem[] = [
  {
    id: 'rep_demo_1',
    title: 'Executive Operations Briefing - Q4 Readiness',
    type: 'Management Summary',
    generatedDate: '2026-10-29',
    isDemo: true,
    executiveSummary: 'Apex Global enters Q4 with solid margin expansion (+4.2% YoY) and strong operational health. Key focus areas remain resolving European transit bottlenecks, concluding the TransLog contract renegotiation before Nov 15, and passing the upcoming ISO 27001 surveillance audit on Nov 25.',
    keyFindings: [
      'North American distribution SLA is exceeding targets at 98.4% on-time performance.',
      'Project Nexus architecture is 65% complete; database latency tuning is currently underway.',
      'European fulfillment turnaround needs recovery from 6.8 days back to 4.0 days target.',
      'Active task completion rate is at 62% across cross-functional workstreams.',
    ],
    statistics: [
      { label: 'Active Projects', value: '3', change: '1 in planning' },
      { label: 'Task Completion', value: '62%', change: '+8% vs last month' },
      { label: 'SLA Achievement (NA)', value: '98.4%', change: 'Target 98.0%' },
      { label: 'ISO 27001 Readiness', value: '85%', change: 'Audit Nov 25' },
    ],
    risksAndChallenges: [
      'TransLog logistics contract expiration on November 15 could impact European delivery schedules if alternative not executed.',
      'Overdue Q3 financial reconciliation task requires immediate closure by Finance.',
    ],
    recommendations: [
      'Execute the short-list tender for European freight with priority routing.',
      'Authorize the $120k engineering tooling budget allocation to optimize Project Nexus database latency.',
      'Conduct final ISO 27001 internal mock walkthrough by November 18.',
    ],
    nextSteps: [
      'Marcus Vance to deliver alternative freight proposals by Nov 10.',
      'Rachel Zhang to present Project Nexus load benchmark report on Nov 12.',
      'HR to initiate recruitment for 45 temporary warehouse team members.',
    ],
    content: `# Executive Operations Briefing — Q4 Readiness

## 1. Executive Summary
Apex Global Enterprises enters Q4 with solid margin expansion (+4.2% YoY) and robust system availability. Operations across North America continue to set benchmark performance. Our principal near-term challenges are concentrated in European logistics throughput and closing remaining compliance non-conformities ahead of the external ISO 27001 surveillance audit.

## 2. Project Portfolio Review
- **Project Nexus (Engineering):** Active at 65% completion. The core microservices backbone is functioning, and database sharding is targeted for completion by November 12.
- **ISO 27001 Certification (Security):** Active at 80% completion. Hardware MFA token distribution is completed; three vendor risk evaluations remain open.
- **Logistics & Vendor Optimization (Operations):** Active at 35% completion. Critical path item is the TransLog contract expiration on November 15.

## 3. Risk Matrix & Strategic Mitigation
The leadership team has established direct action items for all high and urgent priority tasks. With the approved $120,000 budget addition for engineering optimization tooling, risk of platform delay is effectively mitigated.

## 4. Next Steps
Daily coordination meetings are in effect between Procurement and Operations to ensure uninterrupted fulfillment through the holiday volume surge.`,
  },
];
