import Image from 'next/image';

import { teamCardAlt, type TeamMember } from '@/content/about';

/**
 * A team member, shown as the supplied card, whole.
 *
 * The card is a finished composition — logo, photograph, name, role and words — so it is published
 * uncropped and nothing is repeated beside it. An earlier version cropped to the face and set the
 * text in HTML; that lost the design the cards were made for.
 *
 * The cards are not all the same shape, so the frame takes each card's own ratio from the content
 * rather than forcing one on both — a square frame would crop the founder's 3:2 card.
 *
 * The name and role are pixels. Everything that cannot see a picture is served separately and
 * deliberately:
 *
 *   - `alt` carries the name, the role and the words on the card, so a screen reader hears the
 *     card's content rather than "image"
 *   - the visually hidden heading gives the page a real heading structure and an anchor target,
 *     which an `alt` attribute cannot do
 *   - `Person` structured data on the page carries the same facts for search engines
 *
 * None of that is visible, so nothing appears twice.
 */
export function TeamCard({ member, priority = false }: { member: TeamMember; priority?: boolean }) {
  return (
    <figure
      id={member.slug}
      className="group relative scroll-mt-28 overflow-hidden rounded-(--radius-panel) bg-ink-950 shadow-[var(--shadow-panel)] transition-shadow duration-500 hover:shadow-[0_30px_80px_-28px_rgb(11_85_240/0.55)]"
    >
      <div
        className="relative"
        style={{ aspectRatio: `${member.cardWidth} / ${member.cardHeight}` }}
      >
        <Image
          src={member.card}
          alt={teamCardAlt(member)}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, 60vw"
          className="object-cover"
        />
      </div>

      {/* Hairline ring and a gradient edge that lights on hover — decoration only. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-(--radius-panel) ring-1 ring-white/10 ring-inset"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-linear-to-r from-cyan-brand-400 via-brand-500 to-horizon transition-transform duration-700 group-hover:scale-x-100"
      />

      <figcaption className="sr-only">
        <h3>{member.name}</h3>
        <p>{member.role}</p>
        <blockquote>
          <p>{member.quote}</p>
        </blockquote>
      </figcaption>
    </figure>
  );
}
