'use client';

import { m } from 'motion/react';

/** Slides a card up a few pixels as it scrolls into view. Transform only: the content is visible before JS runs. */
export default function FadeIn({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <m.div className={className} initial={{ y: 12 }} whileInView={{ y: 0 }} viewport={{ once: true, margin: '0px 0px -40px 0px' }}
      transition={{ duration: 0.25, ease: 'easeOut' }}>
      {children}
    </m.div>
  );
}
