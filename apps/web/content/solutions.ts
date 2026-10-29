import type { Solution, SolutionStatus } from '@nevix/types';

/**
 * Solutions — NEVIX-built projects (specification §8, instruction §20).
 *
 * Unlike the generic service catalogue, every entry here is a named project NEVIX has actually
 * designed or built, at whatever stage it has genuinely reached. The `status` badge states that
 * stage plainly — concept, prototype, beta or live — and `statusNote` carries a specific caveat
 * wherever a project is not independently verifiable (no source available for review), is a
 * specification rather than a build, or makes a health- or finance-adjacent claim that needs
 * qualifying. None of this is invented: where we cannot verify a claim, the status and note say so
 * instead of rounding up.
 *
 * `illustrativeOutcomes` describes what each project is designed to deliver, not a measured or
 * guaranteed result — specification §31 forbids guaranteed ROI, accuracy or performance claims.
 */
export const solutions: Solution[] = [
  {
    slug: 'aquasales',
    name: 'AquaSales',
    status: 'prototype',
    logo: { src: '/solutions/aquasales.png', alt: 'AquaSales logo', width: 1536, height: 1024 },
    gallery: [
      { src: '/solutions/screenshots/aquasales/01-login.png', alt: 'Login screenshot', caption: 'Login', width: 1672, height: 940 },
      { src: '/solutions/screenshots/aquasales/02-features.png', alt: 'Features screenshot', caption: 'Features', width: 1671, height: 941 },
      { src: '/solutions/screenshots/aquasales/03-dashboard.png', alt: 'Dashboard screenshot', caption: 'Dashboard', width: 1672, height: 941 },
      { src: '/solutions/screenshots/aquasales/04-leads-customer-management.png', alt: 'Leads Customer Management screenshot', caption: 'Leads Customer Management', width: 1672, height: 941 },
      { src: '/solutions/screenshots/aquasales/05-lead-impot.png', alt: 'Lead Import screenshot', caption: 'Lead Import', width: 1672, height: 940 },
      { src: '/solutions/screenshots/aquasales/06-lead-validation.png', alt: 'Lead Validation screenshot', caption: 'Lead Validation', width: 1672, height: 941 },
      { src: '/solutions/screenshots/aquasales/07-campaign-managment.png', alt: 'Campaign Management screenshot', caption: 'Campaign Management', width: 1672, height: 940 },
      { src: '/solutions/screenshots/aquasales/08-create-campaign.png', alt: 'Create Campaign screenshot', caption: 'Create Campaign', width: 1671, height: 941 },
      { src: '/solutions/screenshots/aquasales/09-campaign-templates.png', alt: 'Campaign Templates screenshot', caption: 'Campaign Templates', width: 1672, height: 940 },
      { src: '/solutions/screenshots/aquasales/10-live-calling-monitor.png', alt: 'Live Calling Monitor screenshot', caption: 'Live Calling Monitor', width: 1672, height: 940 },
      { src: '/solutions/screenshots/aquasales/11-whatsapp-automation.png', alt: 'Whatsapp Automation screenshot', caption: 'Whatsapp Automation', width: 1671, height: 941 },
      { src: '/solutions/screenshots/aquasales/12-orders-and-payments.png', alt: 'Orders And Payments screenshot', caption: 'Orders And Payments', width: 1670, height: 941 },
      { src: '/solutions/screenshots/aquasales/13-product-and-catalog.png', alt: 'Product And Catalog screenshot', caption: 'Product And Catalog', width: 1670, height: 942 },
      { src: '/solutions/screenshots/aquasales/14-order-fulfillment.png', alt: 'Order Fulfillment screenshot', caption: 'Order Fulfillment', width: 1670, height: 942 },
      { src: '/solutions/screenshots/aquasales/15-reports-and-analytics.png', alt: 'Reports And Analytics screenshot', caption: 'Reports And Analytics', width: 1670, height: 942 },
      { src: '/solutions/screenshots/aquasales/16-exception-managment.png', alt: 'Exception Management screenshot', caption: 'Exception Management', width: 1670, height: 942 },
      { src: '/solutions/screenshots/aquasales/17-system-health.png', alt: 'System Health screenshot', caption: 'System Health', width: 1670, height: 942 },
      { src: '/solutions/screenshots/aquasales/18-users-and-roles.png', alt: 'Users And Roles screenshot', caption: 'Users And Roles', width: 1670, height: 942 },
      { src: '/solutions/screenshots/aquasales/19-settings.png', alt: 'Settings screenshot', caption: 'Settings', width: 1670, height: 942 },
      { src: '/solutions/screenshots/aquasales/20-closing.png', alt: 'Closing screenshot', caption: 'Closing', width: 1672, height: 941 },
    ],
    statusNote:
      'Demonstrated through project documentation, a recorded walkthrough and screenshots — no source code is available for review, so this is presented as a product demonstration rather than a verified technical build.',
    problem:
      'Beverage and water distribution businesses run sales, campaigns and order processing across phone calls, spreadsheets and disconnected messaging, so leads go unvalidated, call activity is invisible to managers, and the product catalogue drifts out of sync with what sales actually quotes.',
    summary:
      'A sales and operations platform for beverage and water distribution, combining lead capture, WhatsApp campaign automation, live call monitoring, order and payment processing, and a shared product catalogue.',
    heroTitle: 'One platform for distribution sales, from first call to paid order',
    heroDescription:
      'AquaSales brings lead capture, WhatsApp-driven campaigns, live call monitoring, order and payment processing, and catalogue management into one system, with role-based access and system health monitoring underneath it.',
    workflow: [
      {
        title: 'Capture',
        description: 'Leads are captured and validated as they arrive, rather than keyed in later from a notepad or a spreadsheet.',
      },
      {
        title: 'Campaign',
        description: 'Outreach campaigns run through WhatsApp automation directly from the platform, not as a separate manual channel.',
      },
      {
        title: 'Monitor',
        description: 'A live call-monitoring dashboard shows call activity as it happens, built for the pace of an active sales floor.',
      },
      {
        title: 'Order',
        description: 'Orders and payments are processed against the same product catalogue sales is quoting from.',
      },
      {
        title: 'Manage the catalogue',
        description: 'Product and pricing data is maintained in one place and shared across sales, orders and reporting.',
      },
      {
        title: 'Report',
        description: 'Real-time analytics give managers a current view of sales and operations rather than a weekly roll-up.',
      },
    ],
    technicalApproach: [
      'Role-based access so sales, operations and management each see what their role needs, not the whole system',
      'WhatsApp automation integrated directly into campaign workflows rather than run as a separate manual channel',
      'A live call-monitoring view designed for an active sales floor',
      'Order and payment processing kept against the same catalogue sales quotes from, so stock and pricing stay consistent',
      'System health monitoring built into the platform rather than added afterward',
    ],
    illustrativeOutcomes: [
      'Leads validated and routed without manual spreadsheet work',
      'Campaign outreach and order follow-up handled from one platform instead of several disconnected tools',
      'Call activity and order status visible to managers as they happen',
      'One shared catalogue of products and pricing across sales, orders and reporting',
    ],
    relatedServiceSlugs: [
      'web-application-development',
      'workflow-automation',
      'business-intelligence-dashboards',
      'api-integration-orchestration',
    ],
    icon: 'droplet',
    order: 1,
    seo: {
      description:
        'AquaSales: a sales and operations platform for beverage and water distribution businesses, covering lead capture, WhatsApp campaign automation, live call monitoring, order processing and analytics. Presented as a product demonstration — no source code is available for review.',
      noIndex: true,
    },
  },
  {
    slug: 'meditech-buddy',
    name: 'Meditech Buddy',
    status: 'beta',
    logo: { src: '/solutions/meditech-buddy.png', alt: 'Meditech Buddy logo', width: 1536, height: 1024 },
    statusNote:
      'Meditech Buddy is a self-developed health-information and triage-aid project. It does not provide a medical diagnosis, is not a registered or regulatory-cleared medical device, and is not a substitute for professional care — emergency red flags are surfaced so a person can reach real emergency help faster, not instead of it.',
    problem:
      'People describing a health concern often cannot tell quickly whether it needs emergency care, cannot easily reach services in their own language, and arrive at a clinician without a structured account of their symptoms.',
    summary:
      'A multilingual AI health companion (English, Hindi, Marathi) that screens symptoms described by voice, text or photo for emergency red flags, rates urgency, generates a doctor-ready summary and helps locate nearby care.',
    heroTitle: 'A faster, clearer first step when something feels wrong',
    heroDescription:
      'Meditech Buddy lets a person describe symptoms by voice, text or photo in English, Hindi or Marathi, screens for emergency red flags with one-tap access to emergency numbers, rates urgency, produces a doctor-ready summary and helps find nearby hospitals, clinics and pharmacies — with anonymous sessions and automatic data deletion.',
    workflow: [
      {
        title: 'Describe',
        description: 'A person describes what they are feeling by voice, text or photo, in English, Hindi or Marathi.',
      },
      {
        title: 'Screen',
        description: 'The input is screened immediately for emergency red flags — symptoms that call for urgent care rather than a wait-and-see approach.',
      },
      {
        title: 'Alert',
        description: 'When a red flag is detected, one tap connects to an emergency number, with no menu to navigate under stress.',
      },
      {
        title: 'Rate',
        description: 'Non-emergency symptoms are rated for urgency, giving a sense of how soon to seek care.',
      },
      {
        title: 'Summarise',
        description: 'A doctor-ready PDF summary is generated, giving a clinician a structured starting point instead of a verbal recap.',
      },
      {
        title: 'Locate',
        description: 'Nearby hospitals, clinics and pharmacies are surfaced, so the next step is a place to go rather than another search.',
      },
    ],
    technicalApproach: [
      'Multilingual input handling across English, Hindi and Marathi, rather than an English-first product with translations added on top',
      'Red-flag screening treated as a deterministic safety check, run before anything else',
      'Anonymous sessions by default, with no account required to get a screening',
      'Session data deleted automatically rather than retained indefinitely',
      'Voice, photo and text input normalised into one structured symptom record before screening',
    ],
    illustrativeOutcomes: [
      'A faster route to an emergency number when red-flag symptoms are detected',
      'A structured summary a clinician can read in seconds instead of a verbal recap',
      'Symptom description available in a person’s own language instead of English only',
      'No account or persistent profile required to get a screening',
    ],
    relatedServiceSlugs: ['nlp', 'computer-vision', 'generative-ai-solutions', 'application-development'],
    relatedIndustrySlugs: ['healthcare'],
    icon: 'stethoscope',
    order: 2,
    seo: {
      description:
        'Meditech Buddy: a multilingual AI health companion (English, Hindi, Marathi) that screens symptoms for emergency red flags, rates urgency, generates a doctor-ready summary and helps locate nearby care. Not a medical diagnosis or a substitute for professional care.',
      noIndex: true,
    },
  },
  {
    slug: 'vastrix-shopping-agent',
    name: 'Vastrix Shopping Agent (NEVIX.AI)',
    status: 'prototype',
    logo: {
      src: '/solutions/vastrix-shopping-agent.png',
      alt: 'Vastrix Shopping Agent logo',
      width: 1672,
      height: 941,
    },
    gallery: [
      { src: '/solutions/screenshots/vastrix-shopping-agent/01-login.png', alt: 'Login screenshot', caption: 'Login', width: 1671, height: 941 },
      { src: '/solutions/screenshots/vastrix-shopping-agent/02-home-page.png', alt: 'Home Page screenshot', caption: 'Home Page', width: 1671, height: 941 },
      { src: '/solutions/screenshots/vastrix-shopping-agent/03-onboarding.png', alt: 'Onboarding screenshot', caption: 'Onboarding', width: 1671, height: 941 },
      { src: '/solutions/screenshots/vastrix-shopping-agent/04-profile.png', alt: 'Profile screenshot', caption: 'Profile', width: 1671, height: 941 },
      { src: '/solutions/screenshots/vastrix-shopping-agent/05-profile-capture-guide.png', alt: 'Profile Capture Guide screenshot', caption: 'Profile Capture Guide', width: 1671, height: 941 },
      { src: '/solutions/screenshots/vastrix-shopping-agent/06-profile-measurement.png', alt: 'Profile Measurement screenshot', caption: 'Profile Measurement', width: 1670, height: 941 },
      { src: '/solutions/screenshots/vastrix-shopping-agent/07-catalog.png', alt: 'Catalog screenshot', caption: 'Catalog', width: 1670, height: 941 },
      { src: '/solutions/screenshots/vastrix-shopping-agent/08-catalog-products.png', alt: 'Catalog Products screenshot', caption: 'Catalog Products', width: 1670, height: 941 },
      { src: '/solutions/screenshots/vastrix-shopping-agent/09-catalog-produc-details.png', alt: 'Catalog Product Details screenshot', caption: 'Catalog Product Details', width: 1670, height: 941 },
      { src: '/solutions/screenshots/vastrix-shopping-agent/10-try-on.png', alt: 'Try On screenshot', caption: 'Try On', width: 1670, height: 942 },
      { src: '/solutions/screenshots/vastrix-shopping-agent/11-try-on-job-status.png', alt: 'Try On Job Status screenshot', caption: 'Try On Job Status', width: 1670, height: 942 },
      { src: '/solutions/screenshots/vastrix-shopping-agent/12-try-on-results.png', alt: 'Try On Results screenshot', caption: 'Try On Results', width: 1670, height: 942 },
      { src: '/solutions/screenshots/vastrix-shopping-agent/13-try-on-fit-report.png', alt: 'Try On Fit Report screenshot', caption: 'Try On Fit Report', width: 1670, height: 942 },
      { src: '/solutions/screenshots/vastrix-shopping-agent/14-style-compare.png', alt: 'Style Compare screenshot', caption: 'Style Compare', width: 1670, height: 942 },
      { src: '/solutions/screenshots/vastrix-shopping-agent/15-ai-stylist.png', alt: 'AI Stylist screenshot', caption: 'AI Stylist', width: 1670, height: 942 },
      { src: '/solutions/screenshots/vastrix-shopping-agent/16-wadrob.png', alt: 'Wardrobe screenshot', caption: 'Wardrobe', width: 1670, height: 942 },
      { src: '/solutions/screenshots/vastrix-shopping-agent/17-feedback-and-purchase.png', alt: 'Feedback And Purchase screenshot', caption: 'Feedback And Purchase', width: 1670, height: 942 },
      { src: '/solutions/screenshots/vastrix-shopping-agent/18-settings.png', alt: 'Settings screenshot', caption: 'Settings', width: 1670, height: 942 },
      { src: '/solutions/screenshots/vastrix-shopping-agent/19-privacy.png', alt: 'Privacy screenshot', caption: 'Privacy', width: 1670, height: 942 },
      { src: '/solutions/screenshots/vastrix-shopping-agent/20-privacy.png', alt: 'Privacy screenshot', caption: 'Privacy', width: 1672, height: 941 },
      { src: '/solutions/screenshots/vastrix-shopping-agent/21-session-security.png', alt: 'Session Security screenshot', caption: 'Session Security', width: 1669, height: 942 },
      { src: '/solutions/screenshots/vastrix-shopping-agent/22-avatar.png', alt: 'Avatar screenshot', caption: 'Avatar', width: 1670, height: 942 },
    ],
    statusNote:
      'Try-on and styling currently run on mock adapters, and nothing is deployed publicly. This is a prototype demonstrating the concept, not a live shopping product.',
    problem:
      'Online shoppers choose fit and style against generic models and generic size charts, so sizing guesses are frequent and style recommendations ignore what actually fits the individual shopper.',
    summary:
      'A privacy-first AI shopping concept combining virtual try-on, an AI style assistant and fit guidance based on a shopper’s own measurements and profile.',
    heroTitle: 'Try-on and styling built around the shopper’s own measurements',
    heroDescription:
      'Vastrix Shopping Agent combines virtual try-on, an AI style assistant and fit guidance based on a shopper’s own profile and measurements, designed privacy-first from the start.',
    workflow: [
      {
        title: 'Build a profile',
        description: 'A shopper enters their own measurements and preferences once.',
      },
      {
        title: 'Try on virtually',
        description: 'Garments are rendered against the shopper’s profile rather than a generic model.',
      },
      {
        title: 'Ask the style assistant',
        description: 'An AI assistant suggests options based on the shopper’s stated preferences and profile.',
      },
      {
        title: 'Get fit guidance',
        description: 'Sizing guidance is based on the shopper’s own measurements rather than a generic size chart.',
      },
    ],
    technicalApproach: [
      'Try-on and styling currently run against mock adapters while the real integrations are designed, so the concept can be evaluated before committing to a specific try-on or catalogue provider',
      'Fit guidance derived from the shopper’s own measurements rather than a generic size chart',
      'Privacy-first data handling: measurement and profile data scoped to the shopper, not shared with unrelated systems',
      'An adapter-based architecture so a mock integration can be swapped for a real try-on or inventory provider without a rebuild',
    ],
    illustrativeOutcomes: [
      'A way to evaluate fit before committing to a purchase, based on the shopper’s own measurements',
      'Style suggestions grounded in a shopper’s stated profile rather than a generic bestseller list',
      'An architecture that can swap in a real try-on provider without a rebuild, once one is selected',
    ],
    relatedServiceSlugs: [
      'computer-vision',
      'generative-ai-solutions',
      'ai-agents-agentic-automation',
      'web-application-development',
    ],
    icon: 'shopping-bag',
    order: 3,
    seo: {
      description:
        'Vastrix Shopping Agent (NEVIX.AI): a privacy-first AI shopping concept combining virtual try-on, an AI style assistant and fit guidance based on a shopper’s own measurements. Currently a prototype — try-on and styling run on mock adapters and nothing is deployed live.',
      noIndex: true,
    },
  },
  {
    slug: 'nevix-cloud-matrix',
    name: 'Nevix Cloud Matrix',
    status: 'beta',
    logo: {
      src: '/solutions/nevix-cloud-matrix.png',
      alt: 'Nevix Cloud Matrix logo',
      width: 1672,
      height: 941,
    },
    gallery: [
      { src: '/solutions/screenshots/nevix-cloud-matrix/01-login-dashboard.png', alt: 'Login Dashboard screenshot', caption: 'Login Dashboard', width: 1536, height: 1024 },
      { src: '/solutions/screenshots/nevix-cloud-matrix/02-analytics-dashboard.png', alt: 'Analytics Dashboard screenshot', caption: 'Analytics Dashboard', width: 1536, height: 1024 },
      { src: '/solutions/screenshots/nevix-cloud-matrix/03-nlp-chat.png', alt: 'NLP Chat screenshot', caption: 'NLP Chat', width: 1536, height: 1024 },
      { src: '/solutions/screenshots/nevix-cloud-matrix/04-visualization.png', alt: 'Visualization screenshot', caption: 'Visualization', width: 1536, height: 1024 },
      { src: '/solutions/screenshots/nevix-cloud-matrix/05-report.png', alt: 'Report screenshot', caption: 'Report', width: 1536, height: 1024 },
      { src: '/solutions/screenshots/nevix-cloud-matrix/06-cost-analytics.png', alt: 'Cost Analytics screenshot', caption: 'Cost Analytics', width: 1536, height: 1024 },
      { src: '/solutions/screenshots/nevix-cloud-matrix/07-resource-explorer.png', alt: 'Resource Explorer screenshot', caption: 'Resource Explorer', width: 1536, height: 1024 },
      { src: '/solutions/screenshots/nevix-cloud-matrix/08-resource-explorer.png', alt: 'Resource Explorer screenshot', caption: 'Resource Explorer', width: 1536, height: 1024 },
      { src: '/solutions/screenshots/nevix-cloud-matrix/09-business-units.png', alt: 'Business Units screenshot', caption: 'Business Units', width: 1536, height: 1024 },
      { src: '/solutions/screenshots/nevix-cloud-matrix/10-query-history.png', alt: 'Query History screenshot', caption: 'Query History', width: 1536, height: 1024 },
      { src: '/solutions/screenshots/nevix-cloud-matrix/11-admin-dashboard.png', alt: 'Admin Dashboard screenshot', caption: 'Admin Dashboard', width: 1536, height: 1024 },
    ],
    problem:
      'Teams comparing cloud spend across AWS, Azure and GCP rebuild the same spreadsheet repeatedly, budgets are tracked after the fact rather than against a threshold, and cost-optimisation ideas depend on whoever last had time to look.',
    summary:
      'An enterprise multi-cloud cost intelligence platform comparing compute, storage, reserved-instance, Kubernetes and network pricing across AWS, Azure and GCP, with budget alerts, AI-assisted cost-optimisation recommendations and exportable reports.',
    heroTitle: 'One view of cloud cost across three providers',
    heroDescription:
      'Nevix Cloud Matrix compares compute, storage, reserved-instance, Kubernetes and network pricing across AWS, Azure and GCP side by side, tracks budgets with alerts, generates AI-assisted cost-optimisation recommendations, keeps a full calculation history and exports reports to PDF or Excel — with role-based access and a complete audit trail.',
    workflow: [
      {
        title: 'Compare',
        description: 'Compute, storage, reserved-instance, Kubernetes and network pricing across AWS, Azure and GCP are compared side by side.',
      },
      {
        title: 'Track budgets',
        description: 'Budgets are tracked against actual and modelled spend, with alerts when a threshold is crossed.',
      },
      {
        title: 'Get recommendations',
        description: 'AI-assisted cost-optimisation recommendations, generated via Claude, surface where spend can be reduced.',
      },
      {
        title: 'Keep history',
        description: 'Every calculation is retained, so a cost comparison can be revisited rather than re-run from scratch.',
      },
      {
        title: 'Export',
        description: 'Findings export to PDF or Excel for a budget review or a vendor conversation.',
      },
      {
        title: 'Govern access',
        description: 'Role-based access and a full audit trail cover who viewed and changed what.',
      },
    ],
    technicalApproach: [
      'Pricing compared per service category — compute, storage, reserved instances, Kubernetes, network — rather than a single blended estimate',
      'Cost-optimisation suggestions generated by an LLM (Claude) and presented as recommendations for a person to evaluate, not as automatic changes',
      'Calculation history retained so a comparison can be reproduced and reviewed later',
      'Role-based access control with an audit trail on every privileged action',
      'React and TypeScript frontend, FastAPI and PostgreSQL backend',
    ],
    illustrativeOutcomes: [
      'Compute, storage and network pricing compared across three providers without rebuilding a spreadsheet each time',
      'Budget alerts raised before a threshold is crossed rather than discovered on the next invoice',
      'Cost-optimisation options surfaced for a person to evaluate and approve',
      'A reviewable history of past cost calculations, with an audit trail of who accessed what',
    ],
    relatedServiceSlugs: [
      'cloud-devops-engineering',
      'business-intelligence-dashboards',
      'decision-intelligence',
      'reporting-automation',
    ],
    relatedIndustrySlugs: ['enterprise-it'],
    icon: 'cloud',
    order: 4,
    seo: {
      description:
        'Nevix Cloud Matrix: an enterprise multi-cloud cost intelligence platform comparing AWS, Azure and GCP pricing, tracking budgets with alerts, generating AI-assisted cost-optimisation recommendations, and exporting reports — with role-based access and a full audit trail.',
    },
  },
  {
    slug: 'digital-portfolio-website',
    name: 'Digital Portfolio Website',
    status: 'beta',
    logo: {
      src: '/solutions/digital-portfolio-website.png',
      alt: 'Digital Portfolio Website logo',
      width: 1672,
      height: 941,
    },
    problem:
      'Professionals maintain their projects, work history and skills across several documents and profiles, so the record is scattered and producing a clean, shareable summary means assembling it by hand each time.',
    summary:
      'A platform for professionals to build and manage a digital portfolio — projects, education, work history, skills and social links — with secure authentication, image uploads, visibility controls and one-click PDF export.',
    heroTitle: 'One portfolio, maintained once, shareable instantly',
    heroDescription:
      'A digital portfolio platform where a professional maintains projects, education, work history, skills and social links in one place, with section-level visibility controls, image uploads and a one-click PDF export of the finished portfolio.',
    workflow: [
      {
        title: 'Sign up securely',
        description: 'A professional creates an account with secure authentication.',
      },
      {
        title: 'Add content',
        description: 'Projects, education, work history, skills and social links are entered once.',
      },
      {
        title: 'Upload media',
        description: 'Images attach directly to projects and profile sections.',
      },
      {
        title: 'Control visibility',
        description: 'Each section or entry can be shown or hidden from visitors.',
      },
      {
        title: 'Export to PDF',
        description: 'The finished portfolio exports to PDF in one click, formatted for sharing.',
      },
    ],
    technicalApproach: [
      'ASP.NET Core 9 backend with MySQL, serving a React and Tailwind CSS frontend',
      'Section-level visibility controls rather than a single public/private toggle for the whole profile',
      'Image uploads validated and stored separately from portfolio content',
      'PDF export generated from the same structured content that renders the live page, so the two cannot drift apart',
    ],
    illustrativeOutcomes: [
      'One place to maintain projects, education, work history, skills and links instead of several documents',
      'A shareable PDF generated from the same content as the live portfolio page',
      'Visibility controlled per section rather than all-or-nothing',
    ],
    relatedServiceSlugs: [
      'web-application-development',
      'backend-api-development',
      'ui-ux-design',
      'custom-software-development',
    ],
    icon: 'user-round',
    order: 5,
    seo: {
      description:
        'A digital portfolio platform for professionals to manage projects, education, work history, skills and social links, with secure authentication, image uploads, section-level visibility controls and one-click PDF export. Built on ASP.NET Core 9, MySQL and React.',
    },
  },
  {
    slug: 'infra-ansible',
    name: 'Infra Ansible',
    status: 'beta',
    logo: { src: '/solutions/infra-ansible.png', alt: 'Infra Ansible logo', width: 1672, height: 941 },
    gallery: [
      { src: '/solutions/screenshots/infra-ansible/01-login-dashboard.png', alt: 'Login Dashboard screenshot', caption: 'Login Dashboard', width: 1536, height: 1024 },
      { src: '/solutions/screenshots/infra-ansible/02-dashboard.png', alt: 'Dashboard screenshot', caption: 'Dashboard', width: 1536, height: 1024 },
      { src: '/solutions/screenshots/infra-ansible/03-server-dashboard.png', alt: 'Server Dashboard screenshot', caption: 'Server Dashboard', width: 1536, height: 1024 },
      { src: '/solutions/screenshots/infra-ansible/04-playbooks-dashboard.png', alt: 'Playbooks Dashboard screenshot', caption: 'Playbooks Dashboard', width: 1536, height: 1024 },
      { src: '/solutions/screenshots/infra-ansible/05-jobs-dashboard.png', alt: 'Jobs Dashboard screenshot', caption: 'Jobs Dashboard', width: 1536, height: 1024 },
      { src: '/solutions/screenshots/infra-ansible/06-ticket-management.png', alt: 'Ticket Management screenshot', caption: 'Ticket Management', width: 1536, height: 1024 },
      { src: '/solutions/screenshots/infra-ansible/07-users-dashboard.png', alt: 'Users Dashboard screenshot', caption: 'Users Dashboard', width: 1536, height: 1024 },
      { src: '/solutions/screenshots/infra-ansible/08-resource-explorer.png', alt: 'Resource Explorer screenshot', caption: 'Resource Explorer', width: 1536, height: 1024 },
      { src: '/solutions/screenshots/infra-ansible/09-business-units.png', alt: 'Business Units screenshot', caption: 'Business Units', width: 1536, height: 1024 },
      { src: '/solutions/screenshots/infra-ansible/10-cost-analysis.png', alt: 'Cost Analysis screenshot', caption: 'Cost Analysis', width: 1536, height: 1024 },
      { src: '/solutions/screenshots/infra-ansible/11-query-history.png', alt: 'Query History screenshot', caption: 'Query History', width: 1536, height: 1024 },
      { src: '/solutions/screenshots/infra-ansible/12-admin-dashboard.png', alt: 'Admin Dashboard screenshot', caption: 'Admin Dashboard', width: 1536, height: 1024 },
      { src: '/solutions/screenshots/infra-ansible/13-audit-logs.png', alt: 'Audit Logs screenshot', caption: 'Audit Logs', width: 1536, height: 1024 },
      { src: '/solutions/screenshots/infra-ansible/14-automation-dashboard-mockup.png', alt: 'Automation Dashboard Mockup screenshot', caption: 'Automation Dashboard Mockup', width: 1536, height: 1024 },
    ],
    problem:
      'IT teams patch and configure servers one at a time through separate manual sessions, so there is no single view of what is patched, no live record of what a long-running job is doing, and no audit trail of who ran what.',
    summary:
      'A web console that lets IT teams register servers and run Ansible playbooks across them from one place — OS patching with interactive patch selection, configuration management, compliance reporting, live job output and a full audit trail.',
    heroTitle: 'Ansible, with a console IT teams actually want to use',
    heroDescription:
      'Infra Ansible lets a team register servers and run Ansible playbooks across them from one console, with interactive patch selection, configuration management, compliance reporting, live job output, role-based access and a full audit trail — plus a safe “Demo Data” mode for presales walkthroughs that touches no real servers.',
    workflow: [
      {
        title: 'Register servers',
        description: 'IT teams register the servers they manage from one console.',
      },
      {
        title: 'Select patches',
        description: 'OS patching runs through interactive patch selection rather than an all-or-nothing update.',
      },
      {
        title: 'Manage configuration',
        description: 'Configuration changes run as Ansible playbooks against the registered servers.',
      },
      {
        title: 'Watch it run',
        description: 'Job output streams live, so a long-running playbook is not a black box.',
      },
      {
        title: 'Report compliance',
        description: 'Compliance reporting shows which servers are patched and which are not.',
      },
      {
        title: 'Review the trail',
        description: 'Every job and every access is recorded in a full audit trail.',
      },
    ],
    technicalApproach: [
      'A web console in front of Ansible rather than a replacement for it — playbooks remain the source of truth',
      'Interactive patch selection instead of an automatic apply-everything job',
      'Role-based access control gating which servers and playbooks a user can act on',
      'Live job output streamed to the console as the playbook runs',
      'A “Demo Data” mode that exercises the full console against synthetic servers, so a presales walkthrough touches nothing real',
    ],
    illustrativeOutcomes: [
      'Server patching run from one console instead of per-server manual sessions',
      'A visible compliance picture of which servers are patched and which are not',
      'A full audit trail of who ran what, against which servers',
      'A safe way to demonstrate the console in a sales conversation without touching real infrastructure',
    ],
    relatedServiceSlugs: ['infrastructure-it-automation', 'cloud-devops-engineering', 'python-automation'],
    relatedIndustrySlugs: ['enterprise-it'],
    icon: 'server-cog',
    order: 6,
    seo: {
      description:
        'Infra Ansible: a web console for IT teams to register servers and run Ansible playbooks, with interactive OS patch selection, configuration management, compliance reporting, live job output, a full audit trail and a safe Demo Data mode for presales walkthroughs.',
    },
  },
  {
    slug: 'nevix-forge',
    name: 'Nevix Forge — AI Client Demo Generator',
    status: 'coming-soon',
    logo: { src: '/solutions/nevix-forge.png', alt: 'Nevix Forge logo', width: 1672, height: 941 },
    gallery: [
      { src: '/solutions/screenshots/nevix-forge/01-login-dashboard.png', alt: 'Login Dashboard screenshot', caption: 'Login Dashboard', width: 1536, height: 1024 },
      { src: '/solutions/screenshots/nevix-forge/02-dashboard.png', alt: 'Dashboard screenshot', caption: 'Dashboard', width: 1672, height: 941 },
      { src: '/solutions/screenshots/nevix-forge/03-new-project.png', alt: 'New Project screenshot', caption: 'New Project', width: 1536, height: 1024 },
      { src: '/solutions/screenshots/nevix-forge/04-templates.png', alt: 'Templates screenshot', caption: 'Templates', width: 1536, height: 1024 },
      { src: '/solutions/screenshots/nevix-forge/05-my-project.png', alt: 'My Project screenshot', caption: 'My Project', width: 1672, height: 941 },
      { src: '/solutions/screenshots/nevix-forge/06-export.png', alt: 'Export screenshot', caption: 'Export', width: 1672, height: 941 },
      { src: '/solutions/screenshots/nevix-forge/07-analysis-history.png', alt: 'Analysis History screenshot', caption: 'Analysis History', width: 1672, height: 941 },
    ],
    statusNote:
      'This is a detailed project specification, not a built product yet. There is nothing to try — this page describes a planned internal tool.',
    problem:
      'Turning a prospective client’s requirements into a clickable demo for a sales call currently means a manual build or a slide deck, so by the time a demo exists the sales conversation has often moved on.',
    summary:
      'A concept for an internal tool that turns a project brief into a branded, clickable frontend demo in minutes, using an AI pipeline and consistent synthetic data.',
    heroTitle: 'From client brief to clickable demo, planned in minutes',
    heroDescription:
      'Nevix Forge is planned as an internal tool: fill a form describing a prospective client’s requirements, and an AI pipeline would generate a navigable single-page or multi-page prototype with consistent synthetic data, ready to present live in a sales call.',
    workflow: [
      {
        title: 'Describe the brief',
        description: 'A salesperson fills a form describing a prospective client’s requirements.',
      },
      {
        title: 'Generate the demo',
        description: 'An AI pipeline would produce a navigable frontend prototype from that brief.',
      },
      {
        title: 'Populate with data',
        description: 'The prototype would be filled with consistent synthetic data rather than empty placeholders.',
      },
      {
        title: 'Present live',
        description: 'The generated demo would be ready to click through in a live sales call, not just describe in slides.',
      },
    ],
    technicalApproach: [
      'Planned: a form-to-brief pipeline that structures a client’s stated requirements before generation starts',
      'Planned: single-page or multi-page prototype generation depending on the brief’s scope',
      'Planned: synthetic data generated to stay internally consistent across the prototype’s pages',
      'No client data would be used to generate a demo — only the brief entered for that specific pitch',
    ],
    illustrativeOutcomes: [
      'A clickable prototype in minutes instead of a slide deck, for a specific client brief',
      'Synthetic data that stays consistent across every page of the generated demo',
      'No reuse of real client data when generating a pitch demo',
    ],
    relatedServiceSlugs: ['ai-agents-agentic-automation', 'generative-ai-solutions', 'web-application-development'],
    icon: 'sparkles',
    order: 7,
    seo: {
      description:
        'Nevix Forge: a concept for an internal tool that turns a project brief into a branded, clickable frontend demo in minutes, using an AI pipeline and consistent synthetic data. Currently a specification only — not yet built.',
      noIndex: true,
    },
  },
  {
    slug: 'talk-to-database',
    name: 'Talk to Database',
    status: 'beta',
    logo: {
      src: '/solutions/talk-to-database.png',
      alt: 'Talk to Database logo',
      width: 1671,
      height: 941,
    },
    gallery: [
      { src: '/solutions/screenshots/talk-to-database/01-login-dashboard.png', alt: 'Login Dashboard screenshot', caption: 'Login Dashboard', width: 1536, height: 1024 },
      { src: '/solutions/screenshots/talk-to-database/02-analytics-dashboard.png', alt: 'Analytics Dashboard screenshot', caption: 'Analytics Dashboard', width: 1536, height: 1024 },
      { src: '/solutions/screenshots/talk-to-database/03-chat-with-data.png', alt: 'Chat With Data screenshot', caption: 'Chat With Data', width: 1536, height: 1024 },
      { src: '/solutions/screenshots/talk-to-database/04-visualization.png', alt: 'Visualization screenshot', caption: 'Visualization', width: 1536, height: 1024 },
      { src: '/solutions/screenshots/talk-to-database/05-eda-dashboard.png', alt: 'EDA Dashboard screenshot', caption: 'EDA Dashboard', width: 1536, height: 1024 },
      { src: '/solutions/screenshots/talk-to-database/06-query-history-dashboard.png', alt: 'Query History Dashboard screenshot', caption: 'Query History Dashboard', width: 1536, height: 1024 },
      { src: '/solutions/screenshots/talk-to-database/07-business-units-analytics-dashboard.png', alt: 'Business Units Analytics Dashboard screenshot', caption: 'Business Units Analytics Dashboard', width: 1536, height: 1024 },
      { src: '/solutions/screenshots/talk-to-database/08-user-profile-dashboard.png', alt: 'User Profile Dashboard screenshot', caption: 'User Profile Dashboard', width: 1536, height: 1024 },
      { src: '/solutions/screenshots/talk-to-database/09-user-management-dashboard.png', alt: 'User Management Dashboard screenshot', caption: 'User Management Dashboard', width: 1536, height: 1024 },
      { src: '/solutions/screenshots/talk-to-database/10-access-requests-dashboard.png', alt: 'Access Requests Dashboard screenshot', caption: 'Access Requests Dashboard', width: 1536, height: 1024 },
      { src: '/solutions/screenshots/talk-to-database/11-query-logs-dashboard.png', alt: 'Query Logs Dashboard screenshot', caption: 'Query Logs Dashboard', width: 1536, height: 1024 },
      { src: '/solutions/screenshots/talk-to-database/12-analytics-dashboard.png', alt: 'Analytics Dashboard screenshot', caption: 'Analytics Dashboard', width: 1536, height: 1024 },
      { src: '/solutions/screenshots/talk-to-database/13-talk-to-database-analytics-dashboard.png', alt: 'Talk To Database Analytics Dashboard screenshot', caption: 'Talk To Database Analytics Dashboard', width: 1536, height: 1024 },
    ],
    problem:
      'Non-technical staff need answers from company data that lives across several departments, but getting one means writing SQL or waiting on whoever can, so routine questions queue behind a scarce skill.',
    summary:
      'A natural-language data platform that lets non-technical users query company data by typing a question in plain English — AI converts it to a safe, read-only SQL query and returns interactive charts and downloadable reports, with isolated access per business unit.',
    heroTitle: 'Ask company data a question, in plain English',
    heroDescription:
      'Talk to Database lets a non-technical user type a question in plain English; AI converts it to SQL, runs it read-only, and returns interactive charts and downloadable reports, with isolated access per business unit and a full admin analytics dashboard.',
    workflow: [
      {
        title: 'Ask a question',
        description: 'A user types a question in plain English instead of writing SQL.',
      },
      {
        title: 'Convert to SQL',
        description: 'AI converts the question into a SQL query scoped to that user’s business unit.',
      },
      {
        title: 'Run safely',
        description: 'The query runs read-only, so a question can never modify data.',
      },
      {
        title: 'Visualise',
        description: 'Results return as interactive charts rather than a raw table.',
      },
      {
        title: 'Export',
        description: 'Reports download for sharing outside the platform.',
      },
      {
        title: 'Monitor usage',
        description: 'Admins see query activity and usage across business units from one analytics dashboard.',
      },
    ],
    technicalApproach: [
      'Natural-language-to-SQL translation constrained to read-only queries, so a question cannot modify data',
      'Per-business-unit data isolation enforced at the query layer, not just in the interface',
      'Flask and MySQL backend, with a React and Material UI frontend',
      'An admin analytics dashboard kept separate from the query interface non-technical users see',
    ],
    illustrativeOutcomes: [
      'Company data queried in plain English, without writing SQL',
      'Read-only execution, so a question cannot accidentally change data',
      'Each business unit sees only its own data',
      'Results as interactive charts and downloadable reports instead of a raw export',
    ],
    relatedServiceSlugs: ['nlp', 'data-analytics', 'business-intelligence-dashboards', 'reporting-automation'],
    relatedIndustrySlugs: ['enterprise-it'],
    icon: 'database',
    order: 8,
    seo: {
      description:
        'Talk to Database: a natural-language data platform letting non-technical users query company data in plain English. AI converts the question to a safe, read-only SQL query and returns interactive charts and reports, with isolated access per business unit.',
    },
  },
  {
    slug: 'tradeagent',
    name: 'TradeAgent',
    status: 'concept',
    logo: { src: '/solutions/tradeagent.png', alt: 'TradeAgent logo', width: 1671, height: 941 },
    statusNote:
      'TradeAgent is a planning and architecture document only — no code has been written and nothing trades real money. It is a research and concept project, not a financial product: nothing here is financial advice, no trading performance is implied or promised, and automated trading of real funds carries a material risk of loss and may require regulatory licensing in your jurisdiction before it could ever run live.',
    problem:
      'An automated trading system that lets a model’s output place orders directly has no boundary between a market view and a real financial action, which is exactly where uncontrolled risk enters.',
    summary:
      'A planned autonomous trading-system architecture for gold (XAUUSD) on MetaTrader 5, combining AI-assisted market analysis with strictly deterministic risk controls and a single, auditable order-execution gateway.',
    heroTitle: 'A design for keeping AI analysis and order execution strictly separate',
    heroDescription:
      'TradeAgent is an architecture and risk-control design for an autonomous XAUUSD trading system on MetaTrader 5: AI-assisted analysis informs a view, deterministic risk controls constrain it, and one auditable gateway is the only path by which any order would reach the market. No code exists yet.',
    workflow: [
      {
        title: 'Analyse (planned)',
        description: 'AI-assisted analysis would read market data for XAUUSD and produce a market view.',
      },
      {
        title: 'Constrain (planned)',
        description: 'That view would pass through strictly deterministic risk controls — position sizing, exposure limits, stop conditions — that the AI component cannot override.',
      },
      {
        title: 'Execute (planned)',
        description: 'Only a single, auditable gateway would be permitted to place an order, regardless of which component requested it.',
      },
      {
        title: 'Audit (planned)',
        description: 'Every analysis, risk decision and order would be logged for after-the-fact review.',
      },
    ],
    technicalApproach: [
      'Planned: AI-assisted analysis strictly separated from order execution, so a model’s output can inform a decision but never place a trade directly',
      'Planned: deterministic, rule-based risk controls — position size, exposure, stop conditions — sitting between analysis and execution',
      'Planned: a single order-execution gateway, so there is one auditable path by which any order reaches the market',
      'No code exists yet — this is an architecture and risk-control design, not a running system',
    ],
    illustrativeOutcomes: [
      'A clear separation between AI-assisted analysis and the decision to place an order',
      'Risk limits enforced by deterministic rules rather than by the AI component’s judgement',
      'One auditable path for every order, intended to make the system reviewable after the fact',
    ],
    relatedServiceSlugs: ['machine-learning', 'ai-agents-agentic-automation', 'solution-architecture', 'python-automation'],
    relatedIndustrySlugs: ['finance'],
    icon: 'line-chart',
    order: 9,
    seo: {
      description:
        'TradeAgent: a planning and architecture document for an autonomous trading-system concept for gold (XAUUSD) on MetaTrader 5, combining AI-assisted analysis with deterministic risk controls and a single auditable execution gateway. No code exists yet; not a financial product or trading advice.',
      noIndex: true,
    },
  },
  {
    slug: 'resq-agent',
    name: 'RESQ Agent',
    status: 'beta',
    logo: { src: '/solutions/resq-agent.png', alt: 'RESQ Agent logo', width: 1671, height: 941 },
    problem:
      'Service desks spend time on the same recurring issues — account lockouts, VPN access, slow laptops — and every ticket, however routine, starts from a blank slate with no automatic check against documented procedure.',
    summary:
      'An AI-powered IT service desk that works alongside an existing ITSM tool. Employees chat with an assistant that answers from SOPs or walks them through common fixes; when a ticket is needed, it is auto-triaged, resolved, held for approval or escalated to L2 with full context.',
    heroTitle: 'An IT assistant that resolves what it can and escalates with context',
    heroDescription:
      'RESQ Agent sits alongside your existing ITSM tool (e.g. Freshservice). Employees chat with an assistant that answers from your SOPs or walks them through fixes for issues like account lockouts, VPN access and slow laptops; when a ticket is genuinely needed, RESQ raises it, auto-triages it against your SOP library, and resolves it, holds it for approval, or escalates it to L2 with full context — all logged in a complete audit trail, with a manager dashboard for SLA and volume forecasting and a safe “dry run” demo mode.',
    workflow: [
      {
        title: 'Ask',
        description: 'An employee describes an issue to the assistant in chat — an account lockout, VPN access, a slow laptop.',
      },
      {
        title: 'Answer or guide',
        description: 'The assistant answers from the SOP library or walks the employee through the fix directly.',
      },
      {
        title: 'Raise when needed',
        description: 'When a ticket is genuinely required, RESQ raises it in the existing ITSM tool rather than asking the employee to do it separately.',
      },
      {
        title: 'Triage',
        description: 'The ticket is auto-triaged against the SOP library to determine the right response.',
      },
      {
        title: 'Resolve, hold or escalate',
        description: 'Routine issues are resolved automatically, uncertain ones are held for human approval, and anything beyond scope escalates to L2 with full context attached.',
      },
      {
        title: 'Record',
        description: 'Every step — chat, triage decision, resolution or escalation — is logged in a complete audit trail.',
      },
    ],
    technicalApproach: [
      'Works alongside an existing ITSM tool (e.g. Freshservice) rather than replacing it',
      'Auto-triage checked against an SOP library before any action is taken, so responses stay grounded in documented procedure',
      'Three explicit outcomes per ticket — auto-resolve, hold for human approval, or escalate to L2 — rather than one automatic action',
      'Escalations carry full context, so an L2 engineer does not start from zero',
      'A “dry run” demo mode that exercises the full flow without touching real systems or tickets',
    ],
    illustrativeOutcomes: [
      'Common issues like account lockouts, VPN access and slow laptops resolved without opening a ticket at all',
      'Tickets that are raised arrive pre-triaged against the SOP library instead of starting blank',
      'Escalations reach L2 with context attached rather than a bare ticket number',
      'A manager view of SLA performance and ticket volume, including a forecast rather than only a historical count',
    ],
    relatedServiceSlugs: ['ai-agents-agentic-automation', 'intelligent-automation', 'nlp', 'internal-tools-portals'],
    relatedIndustrySlugs: ['enterprise-it'],
    icon: 'life-buoy',
    order: 10,
    seo: {
      description:
        'RESQ Agent: an AI-powered IT service desk that works alongside your existing ITSM tool. Employees chat with an assistant that answers from your SOPs, raises and auto-triages tickets when needed, resolves or escalates with full context, and reports SLA and volume forecasts to managers — with a safe dry-run demo mode.',
    },
  },
  {
    slug: 'thyroidai',
    name: 'ThyroidAI — Thyroid Cancer Detection System',
    status: 'beta',
    logo: { src: '/solutions/thyroidai.png', alt: 'ThyroidAI logo', width: 1536, height: 1024 },
    gallery: [
      { src: '/solutions/screenshots/thyroidai/01-login-interface.png', alt: 'Login Interface screenshot', caption: 'Login Interface', width: 1536, height: 1024 },
      { src: '/solutions/screenshots/thyroidai/02-analytics-dashboard.png', alt: 'Analytics Dashboard screenshot', caption: 'Analytics Dashboard', width: 1536, height: 1024 },
      { src: '/solutions/screenshots/thyroidai/03-new-analysis-dashboard.png', alt: 'New Analysis Dashboard screenshot', caption: 'New Analysis Dashboard', width: 1536, height: 1024 },
      { src: '/solutions/screenshots/thyroidai/04-analysis-history-dashboard.png', alt: 'Analysis History Dashboard screenshot', caption: 'Analysis History Dashboard', width: 1536, height: 1024 },
      { src: '/solutions/screenshots/thyroidai/05-reports-dashboard.png', alt: 'Reports Dashboard screenshot', caption: 'Reports Dashboard', width: 1536, height: 1024 },
      { src: '/solutions/screenshots/thyroidai/06-model-information-dashboard.png', alt: 'Model Information Dashboard screenshot', caption: 'Model Information Dashboard', width: 1536, height: 1024 },
      { src: '/solutions/screenshots/thyroidai/07-medical-chat-dashboard.png', alt: 'Medical Chat Dashboard screenshot', caption: 'Medical Chat Dashboard', width: 1536, height: 1024 },
    ],
    statusNote:
      'ThyroidAI is a research and decision-support prototype. It is not a certified or regulatory-cleared diagnostic device, its classification is not a diagnosis, and it is not a substitute for a qualified radiologist, pathologist or oncologist — every output is intended for a clinician’s review, not for a patient to act on directly.',
    problem:
      'Reviewing thyroid ultrasound and pathology images for signs of malignancy is time-consuming and the basis for a given reading is not always visible to someone checking the work afterward.',
    summary:
      'An AI-assisted medical imaging tool that classifies thyroid ultrasound and pathology images as benign or malignant using a custom CNN (FibonacciNet), with Grad-CAM heatmaps showing the influential regions, analysis history and downloadable DOCX reports.',
    heroTitle: 'A second set of eyes on thyroid imaging, with its reasoning shown',
    heroDescription:
      'ThyroidAI analyses thyroid ultrasound or pathology images with a custom CNN (FibonacciNet), classifying them as benign or malignant and pairing every classification with a Grad-CAM heatmap that highlights which regions influenced it, alongside analysis history, analytics and downloadable DOCX reports.',
    workflow: [
      {
        title: 'Upload',
        description: 'An ultrasound or pathology image of the thyroid is uploaded for analysis.',
      },
      {
        title: 'Classify',
        description: 'A custom CNN (FibonacciNet) classifies the image as benign or malignant.',
      },
      {
        title: 'Visualise',
        description: 'A Grad-CAM heatmap highlights the image regions that most influenced the classification.',
      },
      {
        title: 'Review history',
        description: 'Past analyses are kept, so a case can be revisited rather than re-run from scratch.',
      },
      {
        title: 'Report',
        description: 'Findings export as a downloadable DOCX report for the clinician’s record.',
      },
    ],
    technicalApproach: [
      'A custom convolutional neural network (FibonacciNet) trained for thyroid ultrasound and pathology image classification',
      'Grad-CAM visualisation on every classification, so the influential region is visible rather than only a label',
      'Analysis history retained per case for later review',
      'Findings exported as a structured DOCX report rather than a screenshot',
      'Positioned as a second opinion for a clinician’s review, not an automated diagnosis delivered to a patient',
    ],
    illustrativeOutcomes: [
      'A visual explanation (Grad-CAM) alongside every classification, rather than a label with no shown basis',
      'A reviewable history of past analyses instead of one-off results',
      'A structured report a clinician can file directly, without a manual write-up',
    ],
    relatedServiceSlugs: ['computer-vision', 'machine-learning', 'data-analytics'],
    relatedIndustrySlugs: ['healthcare'],
    icon: 'microscope',
    order: 11,
    seo: {
      description:
        'ThyroidAI: an AI-assisted medical imaging tool that classifies thyroid ultrasound and pathology images as benign or malignant using a custom CNN (FibonacciNet), with Grad-CAM heatmaps, analysis history and downloadable DOCX reports. A research and decision-support prototype, not a diagnostic device.',
      noIndex: true,
    },
  },
];

export const solutionBySlug = new Map(solutions.map((s) => [s.slug, s]));

/** Human-readable labels and styling intent for each build status, mirroring `productStatusMeta`. */
export const solutionStatusMeta: Record<
  SolutionStatus,
  { label: string; description: string; tone: 'neutral' | 'info' | 'warning' | 'success' }
> = {
  concept: {
    label: 'Concept',
    description: 'A planning or architecture document. Not built and not available.',
    tone: 'neutral',
  },
  prototype: {
    label: 'Prototype',
    description: 'A working demonstration used to validate the concept. Not a verified or live build.',
    tone: 'warning',
  },
  beta: {
    label: 'Beta',
    description: 'Built and functioning, with active development ongoing.',
    tone: 'info',
  },
  live: {
    label: 'Live',
    description: 'Generally available and supported.',
    tone: 'success',
  },
  'coming-soon': {
    label: 'Coming Soon',
    description: 'A planned project. Not yet built.',
    tone: 'neutral',
  },
};
