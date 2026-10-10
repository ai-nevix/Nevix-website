# Pre-Launch Replacement Checklist

The site must not go live on a public production domain until every item below is resolved.
Each line maps to an entry in [`registry.md`](./registry.md).

## Blocking — must be replaced or removed before public launch

- [ ] **DD-004** Verified phone number and registered office address (the email,
      `nevix.ai@gmail.com`, was confirmed at the rebrand on 2026-10-10)
- [ ] **DD-005** Registered legal entity name, jurisdiction and registration identifiers
- [ ] **DD-006** Privacy Policy, Terms of Use and Cookie Notice reviewed by counsel; remove the
      `DRAFT` banner only after review
- [ ] **DD-010** Replace each social profile URL — they still point to the former-name profiles —
      with the NEVIX profile as it is created, or delete the entry (a dead link in `Organization`
      schema is worse than no link)

## Blocking unless the section is removed

- [ ] **DD-001** Replace demo case studies with approved ones, **or** remove `/case-studies` from
      navigation and sitemap. Do not publish demo content without the "Demo Case Study" label.
- [ ] **DD-002** Replace concept products with real ones, **or** keep them at "Coming Soon"
      status — which is explicitly permitted by catalogue §16.
- [ ] **DD-003** Publish approved team profiles, **or** leave the marked placeholder in place.
- [ ] **DD-009** Replace the founding-story paragraph with an approved version.

## Non-blocking but tracked

- [ ] **DD-007** Migrate seed insights into Strapi and publish real editorial content
- [ ] **DD-008** Replace team author accounts with real author profiles
- [ ] **DD-011** Brand/legal review of transactional email copy
- [ ] **DD-012** Replace illustrative outcome statements with measured, evidenced outcomes

## Operational gates (not content)

- [ ] `SMTP_*` configured so contact notifications actually send
- [ ] `CMS_API_TOKEN` issued as a **read-only** Strapi token
- [ ] `SECRET_KEY` and `ADMIN_API_KEY` generated with `scripts/generate-secrets.sh`
- [ ] TLS certificates issued for `nevix.ai`, `www.nevix.ai`, `api.nevix.ai`, `cms.nevix.ai`
- [ ] A PostgreSQL restore has actually been performed from backup and verified
      (see `docs/deployment/backup-and-restore.md` — do not tick this from documentation alone)
- [ ] Monitoring hosts confirmed unreachable from the public internet

## Sign-off

| Gate | Owner | Date |
| --- | --- | --- |
| Content approved | Founder / Product Owner | |
| Legal approved | Counsel | |
| Security review | Security | |
| Accessibility review | Engineering | |
| Production deploy approved | Founder / Product Owner | |
