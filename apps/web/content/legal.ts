/**
 * Legal pages.
 *
 * DUMMY-DATA: DD-006
 * These documents are DRAFTS written to make the site production-shaped. They have not been
 * reviewed by counsel and they deliberately make no regulatory, certification or compliance
 * claims. Instruction §71 requires draft marking until the company reviews them; every page
 * renders a prominent draft banner sourced from `draftNotice` below.
 *
 * Replace with counsel-reviewed text and remove the banner before public launch.
 */

export const draftNotice = {
  label: 'Draft',
  text: 'This document is a working draft prepared during website development. It has not been reviewed by legal counsel and is not yet a binding statement of NEVIX policy. Contact us for any question about how your information is handled in the meantime.',
} as const;

export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  list?: string[];
}

export interface LegalDocument {
  slug: 'privacy' | 'terms' | 'cookies';
  title: string;
  description: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
}

export const legalDocuments: LegalDocument[] = [
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    description:
      'How NEVIX collects, uses and retains the personal information submitted through this website. Draft — pending legal review.',
    lastUpdated: '2026-09-17',
    intro:
      'This policy describes what personal information this website collects, why it is collected, how long it is kept and how you can ask for it to be removed. It covers this website only.',
    sections: [
      {
        heading: 'Information we collect',
        paragraphs: [
          'We collect only the information you choose to submit through a form on this site. We do not build profiles of visitors, and we do not collect information about you from third parties.',
        ],
        list: [
          'Enquiry forms: your name, email address, and optionally your organisation, service interest, industry, requirement description, timeline, budget range and any file you attach.',
          'Newsletter subscription: your email address and a record of your consent.',
          'Technical request data: our web server records the IP address, request path, response status and user agent for each request, as web servers ordinarily do. This is used for security and for diagnosing faults.',
        ],
      },
      {
        heading: 'How we use it',
        list: [
          'To respond to your enquiry and to correspond with you about it.',
          'To send the newsletter, where you have explicitly subscribed and confirmed.',
          'To detect and prevent automated abuse of our forms.',
          'To diagnose faults and maintain the security of the service.',
        ],
        paragraphs: [
          'We do not sell personal information. We do not share it with third parties for their own marketing purposes.',
        ],
      },
      {
        heading: 'Analytics and tracking',
        paragraphs: [
          'This website does not use third-party analytics, advertising networks, social media tracking pixels or cross-site tracking of any kind. No third-party scripts are loaded. The site’s Content Security Policy blocks external scripts as a technical control rather than relying on policy alone.',
        ],
      },
      {
        heading: 'Legal basis',
        paragraphs: [
          'Where you submit an enquiry, we process your information on the basis of your request and our legitimate interest in responding to it. Newsletter subscription is processed on the basis of your consent, which you may withdraw at any time using the unsubscribe link in any message.',
        ],
      },
      {
        heading: 'Retention',
        list: [
          'Enquiry records are retained while the enquiry is active and for a reasonable period afterwards for business-record purposes.',
          'Newsletter subscriptions are retained until you unsubscribe.',
          'Web server request logs are retained for a limited period for security and diagnostic purposes.',
          'Uploaded attachments are retained with the enquiry they belong to and are deleted alongside it.',
        ],
        paragraphs: [
          'Specific retention periods will be stated here once this policy has been reviewed and approved.',
        ],
      },
      {
        heading: 'Security',
        list: [
          'All traffic to this website is served over HTTPS.',
          'Enquiry data is stored in a database that is not exposed to the public internet.',
          'Access to enquiry data requires authentication and is limited to the people who need it.',
          'Uploaded files are restricted by type and size and are stored with access controls.',
          'Passwords, tokens and secrets are never written to application logs.',
        ],
        paragraphs: [
          'We describe the controls we implement. We do not claim any security or compliance certification, because NEVIX does not currently hold one.',
        ],
      },
      {
        heading: 'Your rights',
        paragraphs: [
          'You may ask us what information we hold about you, ask for it to be corrected, or ask for it to be deleted. Contact us using the details on the Contact page and we will respond.',
        ],
      },
      {
        heading: 'Changes to this policy',
        paragraphs: [
          'When this policy changes, the revised version will be published here with an updated date.',
        ],
      },
    ],
  },
  {
    slug: 'terms',
    title: 'Terms of Use',
    description: 'The terms on which this website is made available. Draft — pending legal review.',
    lastUpdated: '2026-09-17',
    intro:
      'These terms govern your use of this website. They do not govern any engagement between NEVIX and a client, which is covered by a separate written agreement.',
    sections: [
      {
        heading: 'Purpose of this website',
        paragraphs: [
          'This website describes the services NEVIX offers. It is provided for information. Nothing on it constitutes an offer, a quotation, a warranty or professional advice, and nothing on it forms a contract.',
        ],
      },
      {
        heading: 'Accuracy of content',
        paragraphs: [
          'We aim to keep this site accurate and current. Content describing capabilities, technology approaches and outcomes is general in nature and is not a commitment in respect of any particular engagement.',
          'Case studies marked as demonstration or illustrative content describe representative approaches. They are not accounts of engagements delivered to identified clients, and they are labelled as such wherever they appear.',
        ],
      },
      {
        heading: 'No performance guarantees',
        paragraphs: [
          'Where this site describes outcomes, those descriptions are illustrative of the kind of result a given approach is designed to produce. NEVIX does not guarantee any return on investment, any level of AI accuracy, or that any process can be fully automated. Specific, measurable objectives for an engagement are agreed in the written agreement for that engagement.',
        ],
      },
      {
        heading: 'Acceptable use',
        list: [
          'Do not attempt to gain unauthorised access to any part of this site or its supporting infrastructure.',
          'Do not submit malicious files, malware or content designed to disrupt the service.',
          'Do not use the enquiry or newsletter forms to send unsolicited commercial messages.',
          'Do not use automated means to access the site at a rate that degrades it for others.',
        ],
      },
      {
        heading: 'Intellectual property',
        paragraphs: [
          'The NEVIX name, logo and brand assets, and the content of this website, belong to NEVIX unless stated otherwise. You may read, quote and link to this content with attribution. You may not reproduce it wholesale or present it as your own.',
          'Third-party open-source components used to build this site remain the property of their respective authors and are used under their licences. A licence inventory is maintained as part of the project documentation.',
        ],
      },
      {
        heading: 'External links',
        paragraphs: [
          'Where this site links to an external website, we do not control that site and are not responsible for its content or its handling of your information.',
        ],
      },
      {
        heading: 'Availability',
        paragraphs: [
          'We aim to keep this website available, but it is provided on an "as available" basis. We may change, suspend or withdraw any part of it without notice.',
        ],
      },
      {
        heading: 'Governing law',
        paragraphs: [
          'The governing law and jurisdiction for these terms will be stated here once the registered entity details have been confirmed.',
        ],
      },
    ],
  },
  {
    slug: 'cookies',
    title: 'Cookie Notice',
    description: 'What this website stores in your browser. Draft — pending legal review.',
    lastUpdated: '2026-09-17',
    intro:
      'This notice explains what this website stores in your browser. The short version: no tracking cookies, no advertising cookies, and no consent banner — because there is nothing to consent to.',
    sections: [
      {
        heading: 'Cookies we do not use',
        list: [
          'No analytics cookies. This site does not use Google Analytics or any other third-party analytics service.',
          'No advertising or retargeting cookies.',
          'No social media tracking cookies or embedded tracking pixels.',
          'No cross-site or third-party tracking of any kind.',
        ],
        paragraphs: [
          'Because the site sets no tracking or advertising cookies, no consent banner is required. We have chosen not to display one rather than showing a banner for cookies that do not exist.',
        ],
      },
      {
        heading: 'What may be stored',
        list: [
          'A short-lived anti-abuse token used to protect the enquiry and newsletter forms from automated submission.',
          'Browser local storage, only where you use a preference control that remembers a choice on this device.',
        ],
        paragraphs: ['None of this is used to identify you or to track you across websites.'],
      },
      {
        heading: 'Server logs',
        paragraphs: [
          'Our web server records request data — IP address, path, response status and user agent — as web servers ordinarily do. These are not cookies and are not used for tracking or profiling. They are used for security and fault diagnosis and are retained for a limited period.',
        ],
      },
      {
        heading: 'If this changes',
        paragraphs: [
          'If NEVIX later introduces analytics, we intend to use a self-hosted, privacy-respecting option and to update this notice before doing so. If any future measurement requires consent, a consent mechanism will be added at that point.',
        ],
      },
    ],
  },
];

export const legalDocumentBySlug = new Map(legalDocuments.map((d) => [d.slug, d]));
