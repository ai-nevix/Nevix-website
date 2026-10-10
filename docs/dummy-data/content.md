# Demo Content — What It Says and Why

The reasoning behind each piece of placeholder content. [`registry.md`](./registry.md) records
*what* exists; this records *why it says what it says*, so a reviewer can judge whether the
framing is acceptable rather than only whether it is tracked.

The governing constraint throughout (specification §31, catalogue §16): **do not fabricate
company facts, and never let demo content read as real.**

---

## DD-001 — Demo case studies

**Four studies:** invoice-to-workflow automation, service-desk triage, operations reporting,
grounded knowledge assistant.

**The problem.** Case studies are the most persuasive content a technology company publishes, and
VASTRIX has none it may publish. Leaving the section empty wastes an opportunity to show how the
team thinks; filling it with invented client work would be dishonest and would breach catalogue
§16.

**The approach taken.** Each study is written as a *worked example* rather than an account of
delivered work. The problem, constraints, architecture and trade-offs are real engineering
reasoning; what is absent is any claim that it happened for a client.

**How each is constrained:**

- `kind: 'demo'` drives a prominent banner on the card, on the detail page, and in the page title
  itself — so it appears in a browser tab and in any shared link preview
- the `client` field is **absent**, and the detail page renders "Not applicable — demonstration
  content" where a client name would be
- outcomes are **qualitative** ("manual keying limited to documents failing validation") rather
  than numeric. A percentage would be a fabricated statistic
- `noIndex` on every study, plus `/case-studies` disallowed in `robots.txt`
- structured data emits `CreativeWork` with `disambiguatingDescription` stating it is illustrative
  — never `Article` with an author attribution

**Replacement:** approved, permission-cleared studies with evidenced outcomes. At that point
`kind` becomes `approved`, `client` may be populated, and every outcome needs an `evidence` value
— a content test enforces the last part.

---

## DD-002 — Concept products

**Three products,** all at `concept` status: Document Intelligence Platform, Workflow Automation
Suite, Knowledge Assistant.

**The problem.** Instruction §22 requires a Products section but forbids inventing products.

**The approach taken.** Each is presented as *a direction under consideration*, drawn from
patterns the catalogue already documents VASTRIX building repeatedly. The page leads with
"Nothing here is available yet — and we would rather say so".

**Deliberately absent:** availability dates, pricing, screenshots, waiting lists, customer counts,
or any language implying a commitment to build.

**Replacement:** real product data — or leave them at "Coming Soon", which catalogue §16
explicitly permits.

---

## DD-003 — Team placeholder

**The problem.** An About page without a team reads as incomplete. Inventing biographies is
forbidden by instruction §25 and would be the single most damaging fabrication on the site.

**The approach taken.** A short marked placeholder that says what it is:

> "Team profiles will be published here once they have been approved for release. We have
> deliberately left this section empty rather than filling it with placeholder people."

No stock photographs, no invented names, no "Founder & CEO" with a silhouette.

**Replacement:** approved names, roles, photographs and biographies.

---

## DD-004 — Contact details

**Published:** `vastrix.ai@gmail.com` only.
**Not published:** phone number, street address.

`siteConfig.contact.phone` and `.address` are explicitly `null`, and there is a content test
asserting they stay that way. The contact page says a phone number and registered office will be
published once confirmed.

**Why not a plausible placeholder.** An invented phone number may belong to someone. An invented
address is a false statement about where a company operates — material in a procurement context.

---

## DD-005 — Legal entity line

The footer reads *"Registered entity details to be confirmed."*

Registered name, jurisdiction and registration identifiers were not supplied. These are exactly
the facts a public-sector or enterprise buyer verifies, so a placeholder that looks real would be
worse than an obvious gap.

---

## DD-006 — Draft legal pages

Privacy Policy, Terms of Use and Cookie Notice exist because a production site needs them, and
each carries a prominent **DRAFT — not reviewed by counsel** banner plus `noIndex`.

**What the drafts deliberately do not do:**

- claim any regulatory compliance status or certification
- name a governing jurisdiction (not yet known — DD-005)
- state specific retention periods (marked as pending review)
- promise a security standard VASTRIX does not hold

**What they do accurately, today:** describe the data actually collected, state that no
third-party analytics or tracking exists (verifiable by viewing source), and explain why there is
no cookie banner — there is nothing to consent to.

**Replacement:** counsel-reviewed text. Remove the banner and the `noIndex` only after review.

---

## DD-007 / DD-008 — Seed insights and authors

**Six articles** on evaluation sets, process discovery, pipeline reliability, keeping decisions out
of models, deployment topology, and open-source reversibility.

**The problem.** The Insights system needs content to be demonstrably working, and thin filler
articles would undercut the positioning they are meant to support.

**The approach taken.** Each article argues a position the catalogue already commits VASTRIX to —
problem-first engineering, human-in-the-loop, measurable outcomes. They contain no client
references, no benchmarks, no statistics and no vendor comparisons.

**Authors (DD-008)** are *team accounts* — "VASTRIX Engineering", "VASTRIX Editorial" — not
invented individuals. This exercises the author relation without fabricating people.

---

## DD-009 — Founding story

Three paragraphs of positioning narrative on the About page.

**Contains no** founding date, funding, headcount, milestones, founder names or origin anecdote.
It describes *how the company approaches work*, which is documented in the catalogue, rather than
*what the company has done*, which is not.

---

## DD-010 — Social profile URLs

LinkedIn, GitHub and X links following the brand name, **unconfirmed**.

These appear in the footer and in the `Organization` structured data. A dead link inside structured
data is worse than no link — search engines treat it as a factual claim about the company.

**Replacement:** confirm each URL, or delete the entry. The pre-launch checklist lists this as
blocking.

---

## DD-011 — Newsletter confirmation copy

Transactional double opt-in email text, pending brand and legal review. Functional and accurate;
simply not reviewed.

---

## DD-012 — Illustrative solution outcomes

Every solution page lists expected outcomes, each rendered under a visible notice:

> **Illustrative — not a guarantee.** These describe what the pattern is designed to achieve, not
> a promised result. VASTRIX does not publish guaranteed ROI, accuracy or automation figures.

**The problem.** Solutions need outcome framing to be useful, and specification §31 forbids
guaranteed ROI or performance claims.

**The approach taken.** Outcomes are stated as *design intentions* — "errors caught by validation
before they reach downstream systems" — never as measured results, and never numerically.

---

## What is not here, and will not be added

Recorded so a future contributor does not helpfully fill a gap:

- client names, logos or quotations
- testimonials of any kind
- government approvals, empanelments, tender registrations, marketplace listings
- ISO / SOC 2 / CMMI or any certification claim
- partnership or reseller claims
- revenue, funding, headcount, "projects delivered" or "years in business" counters
- ROI percentages, accuracy percentages, "100% automated"
- awards or press mentions

The content test suite (`apps/web/content/content.test.ts`) fails the build if any of these appear.
It was verified by injecting violations and confirming the suite catches them.
