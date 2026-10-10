'use client';

import dynamic from 'next/dynamic';
import { useSyncExternalStore } from 'react';

/**
 * Decides whether the welcome intro is worth downloading.
 *
 * The animation costs about 130 KB of JavaScript, almost all of it Framer Motion. Most page views
 * never show it — every returning visit in a session, every page that is not the homepage, every
 * visitor who has asked for reduced motion — so loading it eagerly would spend that on people who
 * will never see a frame of it.
 *
 * This module is therefore deliberately tiny and imports none of it. It reads the class that the
 * inline script in `app/layout.tsx` sets before first paint, and only then pulls in the stage.
 *
 * Deferring the download is free here, which is unusual. The midnight curtain is painted by CSS
 * from that same class, with no JavaScript involved at all, so it is already covering the screen
 * while the chunk is still in flight. The visitor sees the brand colour either way; the only
 * difference is whether the animation starts on the first frame or the fifth.
 *
 * `ssr: false` because there is nothing to server-render: the intro exists only in a browser that
 * has already decided to play it.
 */

const NevixIntroStage = dynamic(
  () => import('@/components/branding/nevix-intro-stage').then((m) => m.NevixIntroStage),
  { ssr: false },
);

const ARMED_CLASS = 'nevix-intro-armed';

/**
 * Latches on the first read.
 *
 * The stage removes the class when it finishes, and it animates its own exit. If this wrapper
 * unmounted it the moment the class went away, that exit would be cut off — so once the intro has
 * started, the stage stays mounted and decides for itself when it is done.
 *
 * `useSyncExternalStore` requires a snapshot that is stable between renders, and this is: it reads
 * the DOM once and returns the same value from then on.
 */
let started: boolean | null = null;

function hasStarted() {
  started ??= document.documentElement.classList.contains(ARMED_CLASS);
  return started;
}

/** Nothing to subscribe to — the value never changes after the first read. */
const noSubscription = () => () => {};
/** Never on the server: there is no `<html>` class to read, and no animation to run. */
const notOnServer = () => false;

export function NevixIntro() {
  const playing = useSyncExternalStore(noSubscription, hasStarted, notOnServer);

  return playing ? <NevixIntroStage /> : null;
}
