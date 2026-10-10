import Image from 'next/image';

import { teamCardAlt, type TeamMember } from '@/content/about';

/**
 * A team member, shown as the supplied card, whole.
 *
 * The card is a finished composition — logo, photograph, name, role and quote — so it is published
 * uncropped and nothing is repeated beside it. An earlier version cropped to the face and set the
 * text in HTML; that lost the design the cards were made for.
 *
 * The consequence is that the name and role are pixels. Everything that cannot see a picture is
 * served separately and deliberately:
 *
 *   - `alt` carries the name, the role and the quote, so a screen reader hears the card's content
 *     rather than "image"
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
      className="scroll-mt-28 overflow-hidden rounded-(--radius-panel) border border-neutral-200 bg-white shadow-card"
    >
      {/* The cards are square, so a square frame shows all of one without cropping any of it. */}
      <div className="relative aspect-square">
        <Image
          src={member.card}
          alt={teamCardAlt(member)}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 560px"
          className="object-cover"
        />
      </div>

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
