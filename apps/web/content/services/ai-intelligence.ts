import type { Service } from '@nevix/types';

/**
 * AI & Intelligence services — catalogue §2.
 *
 * `capabilities` reproduce the catalogue's "Typical deliverables" and `useCases` reproduce its
 * "Typical use cases", verbatim. Narrative fields are conservatively derived from the same
 * material. No capability, tool or outcome appears here that the catalogue does not support.
 */
export const aiIntelligenceServices: Service[] = [
  {
    slug: 'generative-ai-solutions',
    name: 'Generative AI Solutions',
    categorySlug: 'ai-intelligence',
    shortDescription:
      'LLM-powered applications for generation, summarization, classification, extraction and knowledge access.',
    heroTitle: 'Generative AI applications with an evaluation loop attached',
    heroDescription:
      'LLM-powered applications for generation, summarization, classification, extraction and knowledge access — designed around a defined task, measured against it, and deployed with the guardrails the task requires.',
    problemStatement:
      'Generative AI is easy to demonstrate and hard to operate. A prompt that works in a chat window behaves differently against real documents, real edge cases and real volume. Teams end up with a convincing prototype and no way to tell whether it is accurate enough to put in front of users, or what happens when it is not.',
    whatWeDo:
      'We start from the task, not the model. We define what a correct output looks like, build an evaluation set from real examples, then design the prompt, retrieval and workflow around it. The result is an application with a measurable quality baseline, explicit handling for low-confidence cases, and a deployment path that does not depend on one person knowing the prompts.',
    capabilities: [
      'AI solution architecture',
      'Model and API integration',
      'Prompt and workflow design',
      'Evaluation and testing',
      'Deployment support',
    ],
    useCases: [
      'Knowledge assistants',
      'Report and content generation',
      'Customer-support assistants',
      'Document summarization',
    ],
    technologyApproach:
      'We select between hosted model APIs and self-hosted open-weight models based on data sensitivity, cost and latency rather than preference. Retrieval-augmented generation is used where answers must be grounded in your own content. Evaluation runs against a versioned test set so a prompt or model change is a measurable decision, not a guess.',
    technologies: [
      'Python',
      'FastAPI',
      'PostgreSQL',
      'pgvector',
      'Open-weight LLMs',
      'Hosted model APIs',
      'Docker',
    ],
    outcomes: [
      'A defined, measurable quality baseline for the task',
      'Explicit handling for low-confidence and out-of-scope inputs',
      'A deployable service rather than a notebook',
      'Documentation that lets another engineer change the system safely',
    ],
    faq: [
      {
        question: 'Do we have to send our data to an external model provider?',
        answer:
          'No. Where data sensitivity requires it, we deploy open-weight models on infrastructure you control. The trade-off is usually cost and capability rather than feasibility, and we set that out explicitly during solution architecture so you can make the decision on evidence.',
      },
      {
        question: 'How do you know whether the output is good enough?',
        answer:
          'We build an evaluation set from real examples of the task before writing the application, and agree what a correct output looks like with the people who will use it. Quality is then reported against that set. We do not guarantee an accuracy figure in advance — any supplier who does is guessing.',
      },
      {
        question: 'What happens when the model gets something wrong?',
        answer:
          'That is a design question we answer up front. Depending on the task the system routes low-confidence outputs to a person, asks a clarifying question, or declines and escalates. Human-in-the-loop where oversight is required is one of our stated engineering principles.',
      },
    ],
    solutionSlugs: ['meditech-buddy', 'vastrix-shopping-agent', 'nevix-forge'],
    caseStudySlugs: ['knowledge-assistant-support-operations'],
    order: 1,
    seo: {
      description:
        'NEVIX builds LLM-powered applications for generation, summarization, classification, extraction and knowledge access, with evaluation, guardrails and deployment support.',
    },
  },
  {
    slug: 'ai-agents-agentic-automation',
    name: 'AI Agents & Agentic Automation',
    categorySlug: 'ai-intelligence',
    shortDescription:
      'Task-oriented agents that use approved tools and APIs, retrieve information and execute controlled multi-step workflows.',
    heroTitle: 'Agents that act inside boundaries you define',
    heroDescription:
      'Task-oriented agents that can use approved tools and APIs, retrieve information and execute controlled multi-step workflows — with approvals, logging and monitoring as first-class parts of the design.',
    problemStatement:
      'An agent that can call your systems is an agent that can damage them. The engineering problem is not getting a model to chain steps together — it is constraining what it may touch, proving what it did, and making sure a person is in the loop before anything irreversible happens.',
    whatWeDo:
      'We define the tool surface explicitly: which APIs the agent may call, with what arguments, under whose authority, and which actions require human approval. Every step is logged with enough context to reconstruct a decision afterwards. The agent is built as a service with the same access controls, rate limits and observability as any other production system.',
    capabilities: [
      'Agent architecture',
      'Tool and API integrations',
      'Approvals and guardrails',
      'Logging and monitoring',
    ],
    useCases: [
      'IT and service-desk triage',
      'Research workflows',
      'Document processing',
      'Operational copilots',
    ],
    technologyApproach:
      'Agents are built as bounded services with an explicit tool registry rather than open-ended system access. Destructive or externally visible actions sit behind an approval step. Every tool call, input and result is written to a structured audit log so behaviour can be reviewed, replayed and tuned.',
    technologies: ['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'Open-weight LLMs', 'Docker'],
    outcomes: [
      'A documented tool surface with least-privilege access',
      'Human approval gates on irreversible actions',
      'A replayable audit trail for every agent decision',
      'Monitoring that shows what the agent is doing in production',
    ],
    faq: [
      {
        question: 'Can the agent take actions on its own?',
        answer:
          'Only the actions you have explicitly approved, through tools we have explicitly built. Anything irreversible or externally visible sits behind a human approval step by default. Expanding that boundary is a deliberate decision, not a side effect of the model getting more capable.',
      },
      {
        question: 'How do we audit what the agent did?',
        answer:
          'Every tool call, its inputs and its result are written to a structured log tied to a request identifier. You can reconstruct the full chain of reasoning and actions for any task after the fact.',
      },
    ],
    solutionSlugs: ['vastrix-shopping-agent', 'nevix-forge', 'tradeagent', 'resq-agent'],
    caseStudySlugs: ['intelligent-ticket-triage-demo'],
    order: 2,
    seo: {
      description:
        'NEVIX builds task-oriented AI agents that use approved tools and APIs to execute controlled multi-step workflows, with guardrails, approvals, logging and monitoring.',
    },
  },
  {
    slug: 'machine-learning',
    name: 'Machine Learning',
    categorySlug: 'ai-intelligence',
    shortDescription: 'Predictive and classification systems using structured data.',
    heroTitle: 'Predictive systems built on data you can actually rely on',
    heroDescription:
      'Predictive and classification systems using structured data — from data preparation and feature engineering through training, evaluation and a deployment-ready model or API.',
    problemStatement:
      'Most machine-learning projects fail before modelling starts. The data is incomplete, the target variable is ambiguous, or the historical record encodes a process that has since changed. A model trained on that produces confident answers to the wrong question.',
    whatWeDo:
      'We spend the early effort on the data and the problem definition: what is being predicted, what a useful prediction horizon is, what the cost of a false positive versus a false negative actually is. Model selection follows from that. We evaluate against a held-out set with metrics chosen for the decision the model supports, and deliver the model behind an API with the preprocessing pipeline attached.',
    capabilities: [
      'Data preparation',
      'Feature engineering',
      'Model training and tuning',
      'Evaluation',
      'Deployment-ready model or API',
    ],
    useCases: ['Prediction', 'Classification', 'Risk scoring', 'Forecasting'],
    technologyApproach:
      'We prefer well-understood models that can be explained to the people relying on them over complex models that cannot. Preprocessing is versioned with the model so training and inference cannot drift apart. Models are served behind a documented API with input validation and monitoring for distribution shift.',
    technologies: ['Python', 'scikit-learn', 'pandas', 'FastAPI', 'PostgreSQL', 'Docker'],
    outcomes: [
      'A model evaluated against metrics that match the decision it supports',
      'A reproducible training pipeline, not a one-off notebook',
      'An inference API with validated inputs',
      'A documented view of where the model should not be trusted',
    ],
    faq: [
      {
        question: 'How much data do we need?',
        answer:
          'It depends on the problem, the number of classes and how noisy the signal is — anyone quoting a universal number is not answering the question. We assess this during discovery and will tell you plainly if the available data cannot support a useful model.',
      },
      {
        question: 'Will you guarantee an accuracy figure?',
        answer:
          'No. We will establish a baseline, report measured performance against a held-out set, and be explicit about where the model is unreliable. Guaranteed accuracy claims are something we deliberately do not make.',
      },
    ],
    solutionSlugs: ['tradeagent', 'thyroidai'],
    order: 3,
    seo: {
      description:
        'NEVIX builds predictive and classification systems on structured data — data preparation, feature engineering, model training, evaluation and deployment-ready APIs.',
    },
  },
  {
    slug: 'nlp',
    name: 'Natural Language Processing',
    categorySlug: 'ai-intelligence',
    shortDescription: 'Systems that process and understand human language.',
    heroTitle: 'Turning unstructured language into something a system can act on',
    heroDescription:
      'Text classification, entity extraction, semantic search, summarization and language workflows — applied to the tickets, feedback, documents and correspondence your organisation already produces.',
    problemStatement:
      'Organisations accumulate enormous volumes of text — tickets, emails, forms, feedback, reports — and then handle it manually because none of it is structured. The information needed to route, prioritise or answer is present; it is simply not in a form any system can use.',
    whatWeDo:
      'We identify the specific decision the text needs to support, then build the narrowest system that supports it: a classifier that routes, an extractor that fills fields, a semantic index that surfaces the right document. Narrow systems are cheaper to evaluate, easier to correct and far more likely to survive contact with production.',
    capabilities: [
      'Text classification',
      'Entity extraction',
      'Semantic search',
      'Summarization',
      'Language workflows',
    ],
    useCases: [
      'Ticket classification',
      'Feedback analysis',
      'Document search',
      'Automated summaries',
    ],
    technologyApproach:
      'We match the approach to the task: classical models where the labels are stable and the volume is high, embedding-based retrieval where the task is finding rather than deciding, and language models where the input is genuinely open-ended. Semantic search is backed by pgvector alongside the existing PostgreSQL database rather than a separate system.',
    technologies: ['Python', 'PostgreSQL', 'pgvector', 'FastAPI', 'Open-weight language models'],
    outcomes: [
      'Structured, queryable output from previously unstructured text',
      'Routing and prioritisation that does not require a person to read everything',
      'Search that finds documents by meaning rather than keyword',
      'A measured confidence threshold below which a person reviews',
    ],
    faq: [
      {
        question: 'Do you support languages other than English?',
        answer:
          'Yes, subject to the available models and the quality of training or evaluation data in that language. We confirm feasibility for your specific languages during discovery rather than assuming it.',
      },
    ],
    solutionSlugs: ['meditech-buddy', 'talk-to-database', 'resq-agent'],
    order: 4,
    seo: {
      description:
        'NEVIX builds NLP systems for text classification, entity extraction, semantic search and summarization — applied to tickets, feedback, documents and correspondence.',
    },
  },
  {
    slug: 'computer-vision',
    name: 'Computer Vision',
    categorySlug: 'ai-intelligence',
    shortDescription:
      'Vision-enabled systems that extract useful information from images or video.',
    heroTitle: 'Extracting information from images and video reliably enough to act on',
    heroDescription:
      'Object detection, image classification, OCR-related workflows, video analytics and inference integration — built around the operating conditions the cameras actually face.',
    problemStatement:
      'Vision models are evaluated on clean datasets and deployed into bad lighting, awkward angles, dirty lenses and compressed video. The gap between benchmark performance and field performance is where most vision projects quietly stop being used.',
    whatWeDo:
      'We establish the real operating conditions before selecting an approach, and evaluate on imagery captured under those conditions. Inference is integrated into a workflow that does something useful with the result — an alert, a record, a routing decision — rather than producing a dashboard nobody watches.',
    capabilities: [
      'Object detection',
      'Image classification',
      'OCR-related workflows',
      'Video analytics',
      'Inference integration',
    ],
    useCases: [
      'Visual inspection',
      'Traffic and video analytics',
      'Image understanding',
      'Monitoring',
    ],
    technologyApproach:
      'We evaluate on imagery from the actual deployment environment, not stock datasets. Inference runs where the latency and bandwidth constraints require — on a server, or closer to the camera when streaming full video is impractical. Results are written into an existing workflow rather than a standalone tool.',
    technologies: ['Python', 'OpenCV', 'PyTorch', 'FastAPI', 'Docker'],
    outcomes: [
      'Performance measured under real operating conditions',
      'Inference integrated into a workflow that produces an action',
      'A defined escalation path for low-confidence detections',
    ],
    faq: [
      {
        question: 'Can this run on our existing camera infrastructure?',
        answer:
          'Often, yes — it depends on resolution, frame rate, placement and network capacity. We assess the existing infrastructure during discovery and will say clearly if a camera change is required to reach usable accuracy.',
      },
    ],
    solutionSlugs: ['meditech-buddy', 'vastrix-shopping-agent', 'thyroidai'],
    order: 5,
    seo: {
      description:
        'NEVIX builds computer vision systems for object detection, image classification, OCR workflows and video analytics, evaluated under real operating conditions.',
    },
  },
  {
    slug: 'document-intelligence',
    name: 'Document Intelligence',
    categorySlug: 'ai-intelligence',
    shortDescription:
      'Automated extraction, classification and validation of information from documents.',
    heroTitle: 'Documents in, structured and validated data out',
    heroDescription:
      'Document ingestion, OCR and extraction integration, classification, validation and structured outputs — turning invoices, forms, applications and reports into data your systems can process.',
    problemStatement:
      'Document handling is where organisations lose the most time to work that no one wants to do. Invoices, forms and applications arrive in inconsistent formats, are keyed in by hand, and carry errors downstream into finance, operations and reporting.',
    whatWeDo:
      'We build an ingestion pipeline that classifies the document, extracts the fields that matter, and validates them against your business rules and reference data before anything is written. Documents that fail validation are routed to a person with the specific problem highlighted, rather than silently entering the system.',
    capabilities: [
      'Document ingestion',
      'OCR and extraction integration',
      'Classification',
      'Validation',
      'Structured outputs',
    ],
    useCases: ['Invoices', 'Forms', 'Applications', 'Reports', 'Operational documents'],
    technologyApproach:
      'Extraction is layered: structured parsing where the format allows, OCR where it does not, and language models for genuinely variable documents. Every extracted field carries a confidence score, and validation rules decide what is auto-processed and what a person reviews. The original document is retained and linked to the extracted record for audit.',
    technologies: ['Python', 'FastAPI', 'PostgreSQL', 'MinIO', 'OCR engines', 'Open-weight LLMs'],
    outcomes: [
      'Structured data from documents that previously required manual keying',
      'Field-level confidence scores driving an explicit review threshold',
      'Validation against business rules before data enters your systems',
      'An audit link from every record back to its source document',
    ],
    faq: [
      {
        question: 'What happens to documents the system cannot read confidently?',
        answer:
          'They are routed to a person for review, with the specific low-confidence fields highlighted. The threshold is a configuration decision you own, and we help you set it based on the measured cost of an error in your process.',
      },
      {
        question: 'Where are the documents stored?',
        answer:
          'On infrastructure you control. Our default deployment uses self-hosted object storage with access controls, and the original document is retained and linked to the extracted record so any figure can be traced back to its source.',
      },
    ],
    caseStudySlugs: ['invoice-to-workflow-automation'],
    order: 6,
    seo: {
      description:
        'NEVIX automates extraction, classification and validation of information from invoices, forms, applications and operational documents, with confidence scoring and human review.',
    },
  },
  {
    slug: 'ai-consulting-integration',
    name: 'AI Consulting & Integration',
    categorySlug: 'ai-intelligence',
    shortDescription:
      'Identify practical AI opportunities and integrate AI into existing products and workflows.',
    heroTitle: 'Work out where AI is worth applying — and where it is not',
    heroDescription:
      'Use-case discovery, feasibility assessment, architecture, proof of concept and an implementation roadmap, so investment follows evidence rather than pressure.',
    problemStatement:
      'Organisations are under pressure to "do something with AI" and the pressure rarely comes with a defined problem. Money goes into pilots that were never going to work because the data was not there, or into replacing processes that were already fine.',
    whatWeDo:
      'We assess candidate use cases against the things that actually determine success: data availability and quality, the cost of an error, how the output reaches a decision, and whether anyone will change their behaviour because of it. The output is a prioritised list with feasibility findings, an architecture for the ones worth pursuing, and an honest account of the ones that are not.',
    capabilities: [
      'Use-case discovery',
      'Feasibility assessment',
      'Architecture',
      'Proof of concept',
      'Implementation roadmap',
    ],
    useCases: ['AI readiness', 'Legacy enhancement', 'AI proof of concept', 'Workflow redesign'],
    technologyApproach:
      'Assessment is deliberately technology-neutral until the problem is understood. Where a proof of concept is justified, we scope it to answer one specific question — usually whether the available data supports the task — rather than building a partial product.',
    technologies: ['Python', 'Architecture documentation', 'Evaluation frameworks'],
    outcomes: [
      'A prioritised list of use cases with feasibility findings',
      'A clear statement of which candidates are not worth pursuing, and why',
      'Solution architecture for the ones that are',
      'A sequenced implementation roadmap',
    ],
    faq: [
      {
        question: 'What if the assessment concludes AI is not the answer?',
        answer:
          'Then that is the finding, and we will say so. Problem-first engineering is one of our stated principles: a well-designed rule-based workflow or a fixed reporting pipeline is frequently the better answer, and it is cheaper to discover that in an assessment than after a build.',
      },
    ],
    order: 7,
    seo: {
      description:
        'NEVIX identifies practical AI opportunities through use-case discovery, feasibility assessment, architecture and proof of concept, producing a prioritised implementation roadmap.',
    },
  },
];
