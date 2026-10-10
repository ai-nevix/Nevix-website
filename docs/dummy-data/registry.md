# Dummy / Demo Data Registry

Authoritative register of every placeholder in the VASTRIX website. Verified in CI by
`npm run audit:dummy-data`.

**Status values:** `Pending` (awaiting real data) · `Replaced` (real data supplied) ·
`Removed` (placeholder deleted rather than replaced).

| ID | Dummy data | Location | Why it exists | Replacement needed | Status |
| --- | --- | --- | --- | --- | --- |
| DD-001 | Four demo case studies, labelled **"Demo Case Study"** in the UI and in the page title | `apps/web/content/case-studies.ts` | No client work has been supplied, and the catalogue (§16) forbids publishing case studies without permission | Approved, permission-cleared VASTRIX case studies with evidence-backed outcomes | Pending |
| DD-002 | Three products at **Concept** status with "Coming Soon" availability | `apps/web/content/products.ts` | No VASTRIX product data exists in the source material; instruction §22 requires "Coming Soon" instead of invented products | Actual product names, descriptions, screenshots and lifecycle status | Pending |
| DD-003 | Team page publishes the two founders from supplied material. No wider-team profiles exist yet, and the About page no longer carries a team section at all | `apps/web/content/about.ts` → `team` | Names, roles, quotes and card artwork were supplied for the founders and are published verbatim. No biographies were supplied for anyone, and none are invented | Approved cards for the wider team, and biographies if anyone wants them | Pending (founders resolved) |
| DD-004 | Contact details: `vastrix.ai@gmail.com`, +91 9552334155, Pune, Maharashtra, India | `apps/web/content/site.ts` → `siteConfig.contact` | Official contact details were not supplied | Verified official email, phone and registered office address | Pending |
| DD-005 | Legal entity line in the footer reads "Registered entity details to be confirmed" | `apps/web/content/site.ts` → `siteConfig.legalEntity` | Registered name, jurisdiction and registration numbers were not supplied | Registered company name, jurisdiction, CIN/GST or equivalent | Pending |
| DD-006 | Privacy Policy, Terms of Use and Cookie Notice marked **DRAFT — not legally reviewed** | `apps/web/content/legal.ts` | Production readiness needs the pages to exist; instruction §71 requires draft marking until company review | Counsel-reviewed legal text | Pending |
| DD-007 | Six seed Insights articles written from the catalogue's documented positioning | `apps/web/content/insights.ts` | The Insights system needs content to be demonstrably working before the CMS is populated | Real VASTRIX editorial content published through Strapi | Pending |
| DD-008 | Insight author records (`VASTRIX Engineering`, `VASTRIX Editorial`) — team accounts, not invented individuals | `apps/web/content/insights.ts` → `authors` | Avoids fabricating named people while still exercising the author relation | Real author profiles once the team page is approved | Pending |
| DD-009 | Founding-story paragraph phrased as positioning, with no dates, funding, headcount or milestones | `apps/web/content/about.ts` → `story` | About page needs narrative; instruction §25/§34 forbid inventing company facts | Approved founding story with verified dates and facts | Pending |
| DD-010 | Social profile URLs point to LinkedIn/GitHub/X handles that may not exist yet | `apps/web/content/site.ts` → `siteConfig.social` | Footer and Organization schema reference social profiles | Confirmed official profile URLs, or removal of the entries | Pending |
| DD-011 | Newsletter double-opt-in confirmation email copy | `apps/api/app/services/email_templates.py` | Transactional copy is required for the flow to work end to end | Brand/legal-reviewed email copy | Pending |
| DD-012 | Illustrative outcome statements on solution pages, each prefixed "Typical outcomes include" and rendered under an "Illustrative — not a guarantee" note | `apps/web/content/solutions.ts` | Solutions need outcome framing; §31 forbids guaranteed ROI or performance claims | Measured outcomes from approved engagements, with evidence | Pending |

## Explicitly NOT present anywhere on the site

Recorded so a future contributor does not "helpfully" add them:

- Client names, client logos or client quotes
- Testimonials of any kind
- Government approvals, empanelments, tender registrations or marketplace listings
- ISO / SOC 2 / CMMI / any certification claim
- Partnership or reseller claims
- Revenue, funding, headcount, "projects delivered" or "years in business" counters
- ROI percentages, accuracy percentages, or "100% automated" claims
- Awards or press mentions
