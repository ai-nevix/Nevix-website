import type { Service } from '@vastrix/types';

/**
 * Data & Analytics services — catalogue §5.
 *
 * `capabilities` and `useCases` reproduce the catalogue's "Typical deliverables" and
 * "Typical use cases" verbatim.
 */
export const dataAnalyticsServices: Service[] = [
  {
    slug: 'data-analytics',
    name: 'Data Analytics',
    categorySlug: 'data-analytics',
    shortDescription:
      'Analyze data to identify trends, performance drivers, anomalies and opportunities.',
    heroTitle: 'Analysis that answers the question that was actually asked',
    heroDescription:
      'Data cleaning, exploratory analysis, KPI analysis and insight reports — starting from the decision the analysis needs to support rather than from whatever data happens to be available.',
    problemStatement:
      'Analysis often begins with the data rather than the question, and produces a deck full of charts that nobody acts on. Meanwhile the question that prompted the work — should we do X or Y — goes unanswered because the data was never assembled to answer it.',
    whatWeDo:
      'We start by establishing the decision at stake and what evidence would change it. Then we assess whether the available data can actually support that, and say so plainly when it cannot. Findings are reported with their limitations attached, because an insight presented without its caveats is a liability.',
    capabilities: ['Data cleaning', 'Exploratory data analysis', 'KPI analysis', 'Insight reports'],
    useCases: ['Business performance', 'Operations', 'Customer analytics', 'Department reporting'],
    technologyApproach:
      'Analysis is reproducible: the transformation from raw data to reported figure is code in version control, not a sequence of spreadsheet steps. Data quality problems found along the way are documented rather than quietly cleaned, because they usually indicate something worth fixing upstream.',
    technologies: ['Python', 'pandas', 'SQL', 'PostgreSQL'],
    outcomes: [
      'Findings tied to a specific decision',
      'A reproducible path from raw data to reported figure',
      'Documented data-quality issues rather than silent corrections',
      'Explicit limitations attached to each finding',
    ],
    solutionSlugs: ['operational-dashboards'],
    order: 1,
    seo: {
      description:
        'VASTRIX analyses data to identify trends, performance drivers, anomalies and opportunities — data cleaning, exploratory analysis, KPI analysis and insight reports.',
    },
  },
  {
    slug: 'business-intelligence-dashboards',
    name: 'Business Intelligence & Dashboards',
    categorySlug: 'data-analytics',
    shortDescription:
      'Create interactive dashboards that turn operational data into decision-ready views.',
    heroTitle: 'Dashboards people open because they change what happens next',
    heroDescription:
      'KPI design, data modelling, dashboard development and documentation — built around the decisions a specific audience makes, not around every metric that could be displayed.',
    problemStatement:
      'Most dashboards are built to display everything measurable and are consequently used by nobody. Without an agreed definition of each metric, two teams report different numbers for the same KPI and the ensuing argument is about the data rather than the decision.',
    whatWeDo:
      'We define each KPI precisely — the calculation, the source, the grain, the refresh cadence — and document it alongside the dashboard. Each view is designed for one audience and the decisions it makes. Metrics nobody acts on are removed rather than relegated to a second tab.',
    capabilities: ['KPI design', 'Data modeling', 'Dashboard development', 'Documentation'],
    useCases: ['Management dashboards', 'Operational monitoring', 'Program and project reporting'],
    technologyApproach:
      'Metrics are defined once in a modelled layer and reused, so the same KPI cannot mean two things in two dashboards. Refresh cadence and data freshness are displayed on the dashboard itself, because a stale figure presented as current is worse than no figure.',
    technologies: ['PostgreSQL', 'SQL', 'Python', 'Grafana', 'Metabase'],
    outcomes: [
      'One agreed definition per KPI, documented and reused',
      'Views designed for a specific audience and decision',
      'Data freshness visible on the dashboard',
      'Metrics nobody acts on removed rather than hidden',
    ],
    solutionSlugs: ['operational-dashboards', 'data-driven-decision-platform'],
    caseStudySlugs: ['operations-reporting-platform'],
    order: 2,
    seo: {
      description:
        'VASTRIX creates interactive dashboards that turn operational data into decision-ready views — KPI design, data modeling, dashboard development and documentation.',
    },
  },
  {
    slug: 'data-engineering-etl',
    name: 'Data Engineering & ETL',
    categorySlug: 'data-analytics',
    shortDescription: 'Collect, transform, validate and move data between systems.',
    heroTitle: 'Pipelines that fail loudly rather than quietly producing wrong numbers',
    heroDescription:
      'Data ingestion, transformation, validation, scheduling and pipeline orchestration — with the validation step treated as the important one.',
    problemStatement:
      'A pipeline that breaks is an inconvenience. A pipeline that partially succeeds is a serious problem: the reports still render, the numbers are wrong, and nobody finds out until someone makes a decision on them.',
    whatWeDo:
      'We validate at every boundary — schema, row counts, referential integrity, business-rule checks — and halt on failure rather than writing partial data. Pipelines are idempotent so a re-run after a fix produces a correct result rather than duplicates. Freshness and volume are monitored so a silent upstream change is noticed.',
    capabilities: [
      'Data ingestion',
      'Transformation',
      'Validation',
      'Scheduling',
      'Pipeline orchestration',
    ],
    useCases: ['Multi-source reporting', 'Analytics feeds', 'Application-to-data pipelines'],
    technologyApproach:
      'Transformations are code in version control, not steps in a GUI. Runs are idempotent and re-runnable. Validation failures stop the pipeline and alert an owner. Row counts and freshness are exported as metrics so anomalies are visible in monitoring rather than discovered in a meeting.',
    technologies: ['Python', 'SQL', 'PostgreSQL', 'Celery', 'Redis', 'Prometheus'],
    outcomes: [
      'Validation at each boundary, halting rather than writing partial data',
      'Idempotent pipelines that are safe to re-run',
      'Freshness and volume exported as monitored metrics',
      'Transformation logic reviewable in version control',
    ],
    solutionSlugs: ['operational-dashboards', 'data-driven-decision-platform'],
    order: 3,
    seo: {
      description:
        'VASTRIX collects, transforms, validates and moves data between systems — data ingestion, transformation, validation, scheduling and pipeline orchestration.',
    },
  },
  {
    slug: 'predictive-analytics',
    name: 'Predictive Analytics',
    categorySlug: 'data-analytics',
    shortDescription:
      'Use statistical and machine-learning methods to estimate future outcomes or risk.',
    heroTitle: 'Forecasts with their uncertainty stated, not hidden',
    heroDescription:
      'Forecasting, regression and classification, evaluation and an inference workflow — with the confidence interval treated as part of the answer rather than a footnote.',
    problemStatement:
      'A point forecast presented without its uncertainty invites false confidence. Planning proceeds as though the number is fact, and the first time anyone considers the error bars is when the actual figure lands outside them.',
    whatWeDo:
      'We report forecasts with prediction intervals and are explicit about the conditions under which the model stops being reliable — regime changes, unseen categories, data older than the process it describes. Backtesting against historical periods establishes what accuracy has actually been achieved rather than what is hoped for.',
    capabilities: [
      'Forecasting',
      'Regression and classification',
      'Evaluation',
      'Inference workflow',
    ],
    useCases: ['Demand forecasting', 'Risk prediction', 'Resource planning', 'Trend forecasting'],
    technologyApproach:
      'Backtesting against held-out historical periods rather than in-sample fit. Prediction intervals reported alongside point estimates. Monitoring for distribution shift so a model that has stopped being applicable is detected rather than trusted indefinitely.',
    technologies: ['Python', 'scikit-learn', 'statsmodels', 'pandas', 'FastAPI', 'PostgreSQL'],
    outcomes: [
      'Forecasts accompanied by prediction intervals',
      'Accuracy established by backtesting, not asserted',
      'Documented conditions under which the model should not be trusted',
      'Monitoring for distribution shift after deployment',
    ],
    faq: [
      {
        question: 'How accurate will the forecast be?',
        answer:
          'We cannot tell you before assessing your data, and we will not guess. What we will do is backtest against historical periods so you see measured accuracy over comparable conditions, with prediction intervals, before you commit to acting on it.',
      },
    ],
    solutionSlugs: ['data-driven-decision-platform'],
    order: 4,
    seo: {
      description:
        'VASTRIX uses statistical and machine-learning methods to estimate future outcomes and risk — forecasting, regression, classification, evaluation and inference workflows.',
    },
  },
  {
    slug: 'reporting-automation',
    name: 'Reporting Automation',
    categorySlug: 'data-analytics',
    shortDescription: 'Automate recurring data collection, report preparation and distribution.',
    heroTitle: 'Recurring reports that prepare and deliver themselves',
    heroDescription:
      'Extraction, transformation, templates, scheduling and delivery — removing the recurring manual assembly that consumes the start of every week or month.',
    problemStatement:
      'Recurring reports are assembled by hand from several systems, on a deadline, by someone with other work to do. The process is error-prone in a way that is hard to detect, because each report looks like the last one.',
    whatWeDo:
      'We automate extraction, transformation and templating so reports generate and distribute on schedule with consistent formatting. Validation runs before distribution, so a report built on incomplete data is held and flagged rather than sent.',
    capabilities: ['Extraction', 'Transformation', 'Templates', 'Scheduling', 'Delivery'],
    useCases: ['Daily, weekly and monthly reports', 'Operational summaries', 'Automated reporting'],
    technologyApproach:
      'Report definitions live in version control so a change to a figure is reviewable and attributable. Pre-distribution validation checks completeness and freshness. Delivery failures alert rather than pass unnoticed, because a report that silently did not arrive is indistinguishable from one nobody read.',
    technologies: ['Python', 'pandas', 'SQL', 'PostgreSQL', 'Celery', 'SMTP'],
    outcomes: [
      'Recurring reports generated and delivered without manual assembly',
      'Validation before distribution, holding incomplete reports',
      'Report definitions reviewable in version control',
      'Alerting on delivery failure',
    ],
    solutionSlugs: ['operational-dashboards'],
    caseStudySlugs: ['operations-reporting-platform'],
    order: 5,
    seo: {
      description:
        'VASTRIX automates recurring data collection, report preparation and distribution — extraction, transformation, templates, scheduling and delivery.',
    },
  },
  {
    slug: 'decision-intelligence',
    name: 'Decision Intelligence',
    categorySlug: 'data-analytics',
    shortDescription: 'Combine data, business rules and analytics to support faster decisions.',
    heroTitle: 'Support the decision, do not hide it inside a model',
    heroDescription:
      'Decision models, scoring, dashboards and recommendation workflows — presenting a recommendation together with the factors that produced it.',
    problemStatement:
      'A score with no explanation does not get used. The person accountable for the decision cannot defend a number they cannot explain, so they fall back on judgement and the system becomes an expensive ornament.',
    whatWeDo:
      'We build scoring and prioritisation that shows its working: which factors contributed, in which direction, and with what weight. The business rules are visible and adjustable by the people who own the policy, without an engineering change. The person keeps the decision.',
    capabilities: ['Decision models', 'Scoring', 'Dashboards', 'Recommendation workflows'],
    useCases: ['Prioritization', 'Resource allocation', 'Operational decision support'],
    technologyApproach:
      'Scoring separates the factor calculation from the weighting policy, so policy can be tuned without touching the model. Every score is stored with the factor values that produced it, so a past decision can be explained later. Rule changes are versioned and their effective date recorded.',
    technologies: ['Python', 'PostgreSQL', 'FastAPI', 'Grafana'],
    outcomes: [
      'Recommendations shown with their contributing factors',
      'Policy weights adjustable without an engineering change',
      'Historical scores explainable after the fact',
      'Versioned rule changes with effective dates',
    ],
    solutionSlugs: ['data-driven-decision-platform', 'operational-dashboards'],
    order: 6,
    seo: {
      description:
        'VASTRIX combines data, business rules and analytics to support faster decisions — decision models, scoring, dashboards and recommendation workflows.',
    },
  },
];
