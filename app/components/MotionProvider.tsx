'use client';

import { LazyMotion, MotionConfig, domAnimation } from 'motion/react';

/** Loads only the small DOM-animation feature set, and turns animation off for people who ask for reduced motion. */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>{children}</LazyMotion>
    </MotionConfig>
  );
}
