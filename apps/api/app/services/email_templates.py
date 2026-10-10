"""Transactional email bodies.

DUMMY-DATA: DD-011
The newsletter confirmation copy is working text pending brand and legal review.

Every template is rendered as plain text and as HTML. The HTML variant escapes all interpolated
values — an enquiry body is attacker-controlled text arriving in a staff inbox, and unescaped
interpolation there is a stored-XSS vector against whoever reads the mail in a browser client.
"""

from __future__ import annotations

from html import escape

from app.core.config import settings


def _row(label: str, value: str | None) -> str:
    if not value:
        return ""
    return (
        '<tr>'
        f'<td style="padding:6px 16px 6px 0;color:#64748b;font-size:13px;white-space:nowrap;'
        f'vertical-align:top">{escape(label)}</td>'
        f'<td style="padding:6px 0;color:#0f172a;font-size:14px">{escape(value)}</td>'
        '</tr>'
    )


def lead_notification(
    *,
    reference: str,
    name: str,
    email: str,
    organization: str | None,
    service_interest: str,
    industry: str | None,
    requirement: str,
    timeline: str | None,
    budget: str | None,
    attachment_url: str | None,
    source: str | None,
) -> tuple[str, str, str]:
    """Internal notification for a new enquiry.

    Returns (subject, text_body, html_body).
    """
    subject = f"[{reference}] New enquiry — {service_interest} — {name}"

    attachment_line = (
        f"{settings.site_url.rstrip('/')}{attachment_url}" if attachment_url else "None"
    )

    text = f"""New enquiry via the NEVIX website

Reference:    {reference}
Name:         {name}
Email:        {email}
Organisation: {organization or "Not provided"}
Interest:     {service_interest}
Industry:     {industry or "Not provided"}
Timeline:     {timeline or "Not provided"}
Budget:       {budget or "Not provided"}
Attachment:   {attachment_line}
Source page:  {source or "Not recorded"}

Requirement
-----------
{requirement}

--
Reply directly to this message to reach the enquirer.
"""

    html = f"""<!doctype html>
<html lang="en">
<body style="margin:0;padding:24px;background:#f8fafc;font-family:ui-sans-serif,system-ui,'Segoe UI',Roboto,sans-serif">
  <table role="presentation" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
    <tr>
      <td style="padding:20px 24px;background:#0a0f1c">
        <div style="color:#22d3ee;font-size:11px;letter-spacing:0.16em;font-weight:700">NEVIX</div>
        <div style="color:#ffffff;font-size:18px;font-weight:700;margin-top:6px">New enquiry</div>
        <div style="color:#94a3b8;font-size:13px;margin-top:4px">Reference {escape(reference)}</div>
      </td>
    </tr>
    <tr>
      <td style="padding:24px">
        <table role="presentation" style="width:100%;border-collapse:collapse">
          {_row("Name", name)}
          {_row("Email", email)}
          {_row("Organisation", organization or "Not provided")}
          {_row("Interest", service_interest)}
          {_row("Industry", industry or "Not provided")}
          {_row("Timeline", timeline or "Not provided")}
          {_row("Budget", budget or "Not provided")}
          {_row("Attachment", attachment_line)}
          {_row("Source page", source or "Not recorded")}
        </table>

        <div style="margin-top:24px;padding-top:20px;border-top:1px solid #e2e8f0">
          <div style="color:#64748b;font-size:11px;letter-spacing:0.14em;font-weight:700;text-transform:uppercase">Requirement</div>
          <div style="margin-top:10px;color:#334155;font-size:14px;line-height:1.65;white-space:pre-wrap">{escape(requirement)}</div>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 24px;background:#f8fafc;color:#64748b;font-size:12px">
        Reply directly to this message to reach the enquirer.
      </td>
    </tr>
  </table>
</body>
</html>"""

    return subject, text, html


def lead_acknowledgement(*, reference: str, name: str) -> tuple[str, str, str]:
    """Acknowledgement sent to the person who submitted an enquiry."""
    subject = f"We have your enquiry — {reference}"

    text = f"""Hello {name},

Thank you for contacting NEVIX. Your enquiry has been received and your reference is {reference}.

A member of the engineering team will read it properly and reply, usually within two working days.
If your enquiry turns out to be outside what we do well, we will tell you that rather than take
the work.

Please quote {reference} if you follow up.

NEVIX
Explore. Automate. Evolve.
{settings.site_url}
"""

    html = f"""<!doctype html>
<html lang="en">
<body style="margin:0;padding:24px;background:#f8fafc;font-family:ui-sans-serif,system-ui,'Segoe UI',Roboto,sans-serif">
  <table role="presentation" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
    <tr>
      <td style="padding:24px;background:#0a0f1c">
        <div style="color:#22d3ee;font-size:11px;letter-spacing:0.16em;font-weight:700">NEVIX</div>
        <div style="color:#ffffff;font-size:20px;font-weight:700;margin-top:8px">We have your enquiry</div>
      </td>
    </tr>
    <tr>
      <td style="padding:28px 24px;color:#334155;font-size:15px;line-height:1.7">
        <p style="margin:0">Hello {escape(name)},</p>
        <p style="margin:16px 0 0">
          Thank you for contacting NEVIX. Your reference is
          <strong style="color:#0f172a;font-family:ui-monospace,monospace">{escape(reference)}</strong>.
        </p>
        <p style="margin:16px 0 0">
          A member of the engineering team will read it properly and reply, usually within two
          working days. If your enquiry turns out to be outside what we do well, we will tell you
          that rather than take the work.
        </p>
        <p style="margin:16px 0 0;color:#64748b;font-size:14px">
          Please quote your reference if you follow up.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 24px;background:#f8fafc;color:#64748b;font-size:12px;letter-spacing:0.08em">
        EXPLORE. AUTOMATE. EVOLVE.
      </td>
    </tr>
  </table>
</body>
</html>"""

    return subject, text, html


def newsletter_confirmation(*, confirm_url: str) -> tuple[str, str, str]:
    """Double opt-in confirmation.

    DUMMY-DATA: DD-011 — pending brand and legal review.
    """
    subject = "Confirm your NEVIX subscription"

    text = f"""Please confirm your subscription

Someone — we hope you — asked to receive occasional emails from NEVIX about applied AI,
automation, data and engineering.

Confirm here:
{confirm_url}

If this was not you, ignore this message. Nothing will be sent and the request expires on its own.

NEVIX
{settings.site_url}
"""

    html = f"""<!doctype html>
<html lang="en">
<body style="margin:0;padding:24px;background:#f8fafc;font-family:ui-sans-serif,system-ui,'Segoe UI',Roboto,sans-serif">
  <table role="presentation" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
    <tr>
      <td style="padding:24px;background:#0a0f1c">
        <div style="color:#22d3ee;font-size:11px;letter-spacing:0.16em;font-weight:700">NEVIX</div>
        <div style="color:#ffffff;font-size:20px;font-weight:700;margin-top:8px">Confirm your subscription</div>
      </td>
    </tr>
    <tr>
      <td style="padding:28px 24px;color:#334155;font-size:15px;line-height:1.7">
        <p style="margin:0">
          Someone — we hope you — asked to receive occasional emails from NEVIX about applied AI,
          automation, data and engineering.
        </p>
        <p style="margin:24px 0">
          <a href="{escape(confirm_url)}"
             style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600;font-size:14px">
            Confirm subscription
          </a>
        </p>
        <p style="margin:0;color:#64748b;font-size:13px">
          If this was not you, ignore this message. Nothing will be sent and the request expires on
          its own.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>"""

    return subject, text, html
