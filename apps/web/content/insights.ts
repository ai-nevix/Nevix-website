import type { Author, Insight, InsightCategory } from '@nevix/types';

/**
 * Insights — CMS-backed editorial content (specification §9.3, instruction §24).
 *
 * DUMMY-DATA: DD-007
 * These seed articles exercise the Insights system before Strapi is populated. They are written
 * from the documented NEVIX positioning and contain no client references, statistics,
 * benchmarks or performance claims. Replace with real editorial content published through the
 * CMS.
 *
 * DUMMY-DATA: DD-008
 * Authors are team accounts rather than invented individuals, so the author relation works
 * without fabricating people. Replace with real author profiles once the team page is approved.
 */

export const insightCategories: InsightCategory[] = [
  { slug: 'ai', name: 'AI', description: 'Applied AI, evaluation, guardrails and integration.' },
  {
    slug: 'automation',
    name: 'Automation',
    description: 'Process, workflow and infrastructure automation.',
  },
  {
    slug: 'data',
    name: 'Data',
    description: 'Pipelines, analytics, reporting and decision support.',
  },
  {
    slug: 'engineering',
    name: 'Engineering',
    description: 'Architecture, APIs, testing and maintainability.',
  },
  {
    slug: 'cloud',
    name: 'Cloud',
    description: 'Deployment, containers, infrastructure and operations.',
  },
  {
    slug: 'technology',
    name: 'Technology',
    description: 'Technology selection, open source and platform decisions.',
  },
  {
    slug: 'digital-transformation',
    name: 'Digital Transformation',
    description: 'Programme design, prioritisation and organisational change.',
  },
];

export const authors: Author[] = [
  {
    slug: 'nevix-engineering',
    name: 'NEVIX Engineering',
    role: 'Engineering team',
    bio: 'Written by the NEVIX engineering team. Individual author profiles will be published once approved.',
  },
  {
    slug: 'nevix-editorial',
    name: 'NEVIX Editorial',
    role: 'Editorial team',
    bio: 'Written by the NEVIX editorial team. Individual author profiles will be published once approved.',
  },
];

export const insights: Insight[] = [
  {
    slug: 'evaluation-before-prompts',
    title: 'Build the evaluation set before you write the prompt',
    excerpt:
      'The most common reason a generative AI project stalls is that nobody agreed what a correct answer looks like. Building the evaluation set first changes which approach you pick.',
    authorSlug: 'nevix-engineering',
    categorySlug: 'ai',
    tags: ['generative-ai', 'evaluation', 'llm', 'quality'],
    publishedAt: '2026-06-12',
    featured: true,
    content: `A generative AI prototype is easy to produce and difficult to judge. You write a prompt, try it on a handful of examples, and it works. The demonstration goes well. Then someone asks how accurate it is, and there is no answer — because nobody has defined what accurate means for this task.

## The problem with judging by inspection

Evaluating outputs by reading them has two failure modes, and projects usually hit both.

The first is selection. You test on the examples you happen to have, which are the clean ones, because clean examples are what people reach for when they are demonstrating something. The messy inputs — the scanned document at an angle, the request written in three languages, the form with a field left blank — are exactly the inputs where the system will fail, and exactly the ones missing from your informal test set.

The second is drift. You change the prompt to fix a case, and something else breaks. Without a fixed set to measure against, you cannot tell whether the change helped overall. Teams end up tuning in circles, each change fixing the most recently reported problem and silently regressing something else.

## Build the set first

Assemble a set of real examples of the task before writing application code. Include the awkward ones deliberately — they are the reason the set exists. For each, agree what a correct output looks like with the people who will actually use the system. This conversation is frequently where the project's real requirements surface.

The set does not need to be large to be useful. A few dozen well-chosen examples covering the range of real inputs will tell you more than several hundred clean ones.

## What changes when you have it

Three things, in our experience.

**The approach changes.** Once you can see performance across the full range of inputs, the right architecture often turns out to be different from the obvious one. A pipeline that parses structured documents first and falls back to a model is frequently better than a model-first design — but you only discover that if the awkward inputs are in your measurements.

**Changes become decisions.** With a fixed evaluation set, changing a prompt or swapping a model produces a number you can compare. It becomes a reviewable engineering decision rather than a matter of opinion.

**The threshold becomes real.** Most useful AI systems route low-confidence cases to a person. Setting that threshold requires knowing the relationship between confidence and correctness, which requires measurement. Without it, the threshold is a guess that someone will later describe as a design decision.

## What it does not give you

An evaluation set tells you how the system performed on those examples. It does not entitle anyone to guarantee a percentage in advance, and we do not make that kind of claim. What it gives you is a measured baseline, a way to detect regression, and an honest basis for deciding whether the system is good enough for the decision it supports.

That is a considerably stronger position than a convincing demonstration.`,
    seo: {
      description:
        'Why building an evaluation set before writing prompts changes which architecture you choose, and turns prompt changes into reviewable engineering decisions.',
    },
  },
  {
    slug: 'automate-the-process-you-have',
    title: 'Automate the process you have, not the one in the documentation',
    excerpt:
      'Documented processes and performed processes diverge over years of workarounds. Automating the documented version produces a system that fails on the first real case.',
    authorSlug: 'nevix-engineering',
    categorySlug: 'automation',
    tags: ['process-automation', 'discovery', 'workflow'],
    publishedAt: '2026-05-28',
    featured: true,
    content: `Every organisation has two versions of its processes. There is the documented version — the one in the procedure manual, the one described in the workshop. And there is the performed version, which is the documented one plus a decade of accumulated exceptions, workarounds and undocumented judgement.

Automation projects that start from the documented version produce systems that break on the first real case. Everyone quietly reverts to doing it by hand, and the automation becomes a line item nobody wants to discuss.

## Where the divergence lives

The gap is rarely in the main path. The main path is usually documented accurately, because it is what people describe when asked.

The divergence lives in the exceptions:

- The supplier whose invoices arrive in a different format, handled by one person who knows what to do
- The approval that is technically required but skipped when the amount is below an informal threshold
- The step that was added after an incident three years ago, and is now performed without anyone remembering why
- The data-entry field everyone fills with a placeholder because the real value arrives later

None of these appear in the documentation. All of them will break an automated workflow.

## Discovery means watching

The way to find these is to observe the process being performed, and to ask about the last ten cases rather than about the process in general. "What happens when..." questions produce the documented answer. "What happened with this one?" produces the real one.

Three questions are consistently productive:

1. **When was the last time this did not go as expected, and what did you do?**
2. **Which cases do you handle differently, and how do you recognise them?**
3. **What do you check before you commit this?** — informal validation is usually invisible until you ask.

## Then decide, explicitly

Once the exceptions are catalogued, each needs a decision. In our experience they fall into three groups.

**Automate it.** The exception is mechanical and its rule is stateable. It goes into the workflow as a branch.

**Route it.** The exception needs judgement. The workflow detects it and routes it to a person, with the relevant context attached. This is a success, not a failure — the aim is to remove mechanical work, not human judgement.

**Fix it.** Some exceptions turn out to be symptoms of a problem upstream. A supplier sending an unusable format can often just be asked to change it. Automating around an avoidable problem preserves it permanently.

## The output of discovery

The deliverable is not a process diagram. It is a catalogue of exceptions with a decision recorded against each one, because that catalogue is what determines whether the automation survives contact with production.

It also tends to be the most useful document the organisation has about how the work is actually done — which is frequently valuable independently of whether anything gets automated at all.`,
    seo: {
      description:
        'Documented and performed processes diverge. How to find the exceptions during discovery, and why cataloguing them determines whether automation survives production.',
    },
  },
  {
    slug: 'pipelines-should-fail-loudly',
    title: 'A pipeline that half-succeeds is worse than one that fails',
    excerpt:
      'A broken pipeline is an inconvenience. A partially successful one renders reports that look correct and are not, and nobody finds out until a decision has been made on them.',
    authorSlug: 'nevix-engineering',
    categorySlug: 'data',
    tags: ['data-engineering', 'etl', 'validation', 'reliability'],
    publishedAt: '2026-05-14',
    content: `When a data pipeline fails outright, someone notices within a day. The dashboard is empty, the report does not arrive, and the problem gets fixed.

When a pipeline partially succeeds, nothing looks wrong. The dashboard renders. The report arrives on schedule. The numbers are lower than last week, which is interesting rather than alarming. Someone makes a decision on them.

The second failure mode is considerably more expensive, and it is the one most pipelines are built to produce.

## How partial success happens

Usually not through a dramatic bug. The common causes are mundane:

- One source of five was slow, timed out, and the job continued with four
- A schema changed upstream and a column now arrives as null rather than a value
- A join lost rows because a reference table had not yet loaded
- A retry ran after a partial write, duplicating a subset of records

In each case the pipeline completed. Its exit code was zero. Its output was wrong.

## Validate at every boundary

The fix is unglamorous: check the data at each point it crosses a boundary, and stop when a check fails.

**Schema.** Does the incoming data have the columns and types expected? A silent type change is a common cause of nulls appearing downstream.

**Volume.** Is the row count within the expected range for this period? A load that is 40% of normal is nearly always a problem, not a business event.

**Referential integrity.** Do the foreign keys resolve? Rows that will be dropped by a join should be counted and reported, not dropped quietly.

**Business rules.** Do the totals reconcile? Are the dates plausible? Are the mandatory fields populated?

When a check fails, the pipeline should halt and alert — not log a warning and continue. A warning in a log nobody reads is functionally identical to no check at all.

## Make re-runs safe

Halting only works if fixing the problem and re-running is straightforward. That requires idempotency: running the same job twice over the same period must produce the same result, not duplicates.

In practice this means writes keyed on a natural or composite key rather than appended blindly, and partitioned deletes-then-inserts rather than incremental appends where the source can be restated.

## Make the state visible

Two things belong in monitoring rather than in a log file:

**Freshness** — how old is the most recent data in each table? A pipeline that silently stopped running three days ago is invisible unless freshness is measured.

**Volume** — row counts per run, over time. Anomalies are obvious in a series and invisible in isolation.

Both are cheap to export and both catch the failure mode that matters: the one where nothing appears to be wrong.

## And show it to the reader

Finally, put data freshness on the dashboard itself. A figure that is three days old presented without qualification will be read as current. Displaying the timestamp costs a line of code and prevents a category of error that is otherwise impossible to detect from the consuming end.`,
    seo: {
      description:
        'Why partial pipeline success is more dangerous than outright failure, and the validation, idempotency and monitoring practices that prevent it.',
    },
  },
  {
    slug: 'keep-the-decision-out-of-the-model',
    title: 'Keep the decision out of the model',
    excerpt:
      'AI is good at reading unstructured input. It is a poor place to put a decision that must be explainable, reproducible and changeable by someone who is not an engineer.',
    authorSlug: 'nevix-engineering',
    categorySlug: 'ai',
    tags: ['intelligent-automation', 'governance', 'architecture', 'llm'],
    publishedAt: '2026-04-22',
    featured: true,
    content: `There is a design decision at the centre of most intelligent automation systems, and it is usually made by accident.

When a model can read a document and also decide what to do with it, the obvious implementation is to let it do both. One call, one result. It works in testing.

It is almost always the wrong architecture, and the reasons have little to do with accuracy.

## Three properties you lose

**Explainability.** Someone will eventually ask why a particular item was rejected, escalated or prioritised. If the decision was made inside a model, the honest answer is that nobody knows. In regulated contexts, and in any context where the decision affects a person, that is not an acceptable answer.

**Reproducibility.** The same input should produce the same decision. Models are not guaranteed to, and even at temperature zero a model update changes behaviour. A decision layer that changes when a vendor ships a release is not a decision layer you control.

**Ownership.** Policy belongs to the people accountable for it. If the approval threshold lives in a prompt, changing it requires an engineer, a review and a deployment. If it lives in configuration, the person who owns the policy changes it. That difference determines whether the system stays current or slowly diverges from actual practice.

## The split

Give each layer the job it is suited to.

**The model reads.** It turns unstructured input into structured fields — category, extracted values, entities — each with a confidence score. It does not decide anything.

**Rules decide.** A deterministic layer takes those fields, applies your policy, and produces an outcome. Same input, same output, every time. Auditable, and changeable without retraining anything.

**Confidence routes.** Where extraction confidence is below threshold, the item goes to a person before the rules run. The threshold is configuration, set from measured data about how confidence relates to correctness.

## What this costs

More components, and a genuine constraint: the rules layer can only act on fields the extraction layer produces. You have to decide up front what the decision depends on, which is more design work than passing everything to a model and asking for a verdict.

That constraint is mostly a benefit. Enumerating what a decision depends on is valuable work regardless of whether software is involved, and organisations frequently discover during this exercise that the decision was less consistent than they believed.

## What it buys

An audit trail that shows the extracted values and the rule that fired. Policy changes that do not require engineering. Behaviour that does not shift when a model is updated. And a clear boundary for measurement: you can track extraction quality and decision volume separately, so a drop in one is distinguishable from a change in the other.

Models should read. Rules should decide. People should own the rules.`,
    seo: {
      description:
        'Why AI should extract and deterministic rules should decide — the explainability, reproducibility and policy-ownership case for separating the two layers.',
    },
  },
  {
    slug: 'you-probably-do-not-need-kubernetes-yet',
    title: 'You probably do not need Kubernetes yet',
    excerpt:
      'A single Linux host running Docker Compose handles far more traffic than most teams assume. Orchestration introduced early is a cost paid every day afterwards.',
    authorSlug: 'nevix-engineering',
    categorySlug: 'cloud',
    tags: ['docker', 'deployment', 'infrastructure', 'architecture'],
    publishedAt: '2026-03-19',
    content: `Kubernetes solves real problems. Most of them are problems of scale, isolation and organisational structure — many teams, many services, independent deployment cadences, heterogeneous scaling requirements.

If you have those problems, Kubernetes is a reasonable answer. If you have one application, one database and a reverse proxy, it is an answer to a question nobody asked, and you will pay for it daily.

## The daily cost

The cost is not the initial setup, which is well documented and finite. It is everything afterwards.

**Debugging gains a layer.** A request that fails now might be failing in the ingress, the service, the pod, the container or the application. Each has its own logs and its own failure semantics.

**Configuration multiplies.** Manifests, values files, secrets, config maps, ingress rules, network policies. Each is a place a change can go wrong and a thing a new engineer must learn before they can deploy.

**The upgrade treadmill starts.** Cluster versions, deprecated APIs, controller updates. This is ongoing work that produces no user-visible improvement.

**Expertise becomes a dependency.** The number of people who can confidently diagnose a cluster problem at 3am is smaller than the number who can read \`docker compose logs\`.

## What a single host actually handles

More than most teams expect. A modest server running a containerised application, a database and a reverse proxy serves a great deal of traffic before anything needs to change. Static and cached content is served from memory. Databases are fast when they are not competing for resources.

The constraint people cite is availability rather than capacity — a single host is a single point of failure. That is true, and worth addressing when the cost of downtime justifies it. But high availability is achievable well before orchestration: a warm standby, a tested restore procedure and a documented failover are simpler, cheaper and more likely to work under pressure than a cluster nobody has failed over in anger.

## What to do instead

Start with Docker Compose on one host behind a reverse proxy. Then invest in the things that actually reduce risk:

- **A rehearsed rollback.** Documented, and actually practised. Most incidents are resolved by going back, not forward.
- **A tested restore.** A backup you have never restored is a hypothesis. Restore it to a scratch host and confirm.
- **Health checks and metrics.** Knowing something is wrong early matters more than any particular deployment topology.
- **Reproducible provisioning.** Configuration as code, so rebuilding the host is a command rather than a research project.

Each of these reduces real risk. Introducing orchestration before them adds complexity without addressing the failure modes you will actually experience.

## When to move

Write down the trigger in advance. Reasonable ones: more services than a single compose file can sensibly describe; teams that need to deploy independently; workloads with genuinely different scaling profiles; isolation requirements that a single host cannot satisfy.

Having the trigger written down gives you a defensible reason to move later, and — more usefully — a defensible reason not to yet.`,
    seo: {
      description:
        'Why a single host with Docker Compose is the right starting topology for most applications, what orchestration costs daily, and how to define the trigger for moving.',
    },
  },
  {
    slug: 'open-source-by-default',
    title: 'Choosing an open-source stack is a reversibility decision',
    excerpt:
      'The argument for open source in enterprise and public-sector systems is rarely cost. It is the ability to change your mind later without rewriting the application.',
    authorSlug: 'nevix-editorial',
    categorySlug: 'technology',
    tags: ['open-source', 'architecture', 'procurement', 'self-hosting'],
    publishedAt: '2026-02-26',
    content: `Discussions about open source tend to arrive quickly at licence cost, which is the least interesting part of the question. Managed platforms are often cheaper than self-hosting once operational effort is priced honestly.

The more useful question is reversibility: if this decision turns out to be wrong in three years, what does it cost to change?

## Where lock-in actually accumulates

Not usually in the obvious place. Swapping one relational database for another is difficult but bounded. The expensive dependencies are the ones that shape the application.

**Proprietary data models.** When your domain objects are defined by a platform's schema, and its identifiers propagate through your codebase, migration means rewriting the application rather than moving the data.

**Platform-specific runtime assumptions.** Functions with a particular invocation model, queues with specific delivery semantics, authentication tied to one identity provider's tokens. Each is a place your code assumes something only that platform provides.

**Operational coupling.** Monitoring, logging and deployment built around one provider's tooling. This is rarely counted as lock-in and is frequently the slowest part to unwind.

## What self-hostable buys

The point is not that you will self-host. It is that you could.

That option has value even unexercised. It affects your position in a renewal conversation. It determines whether a change in pricing, terms or regional availability is an inconvenience or a crisis. In public-sector procurement it is often a requirement, and for good reason — systems are expected to outlive both the supplier relationship and the team that built them.

There is also a practical benefit during development: when the whole stack runs locally in containers, every developer has a complete environment. No shared staging contention, no "works differently against the real service", no waiting for someone to provision an account.

## Where the argument stops

Being open source does not make software better, and this position has limits worth stating plainly.

Self-hosting transfers operational burden to you. Backups, upgrades, security patching and capacity planning become your responsibility. That is a real cost and should be budgeted rather than discovered.

Some capabilities have no adequate open-source equivalent, and pretending otherwise produces a worse system. The honest approach is to use the proprietary component, isolate it behind an interface you control, and document the exception — which is precisely what we do rather than claiming the stack is pure.

And "open source" needs verifying at the version you actually use. Licences change, projects relicense, and a dependency that was permissive two major versions ago may not be now. A licence inventory recorded at the pinned version is the only version of this claim worth making.

## The decision in one line

Choose the stack that lets you change your mind later, then document the places where you could not.`,
    seo: {
      description:
        'The case for open-source, self-hostable stacks is reversibility rather than cost — where lock-in accumulates, what the self-host option is worth, and where the argument stops.',
    },
  },
];

export const insightBySlug = new Map(insights.map((i) => [i.slug, i]));
export const authorBySlug = new Map(authors.map((a) => [a.slug, a]));
export const insightCategoryBySlug = new Map(insightCategories.map((c) => [c.slug, c]));

/** Every distinct tag across published insights, sorted for stable rendering. */
export const insightTags = [...new Set(insights.flatMap((i) => i.tags))].sort();
