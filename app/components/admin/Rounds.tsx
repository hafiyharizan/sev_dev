'use client';

import { Fragment, useState } from 'react';

/** Remounts its children (a fresh, empty form) each time `again()` is called. */
export default function Rounds({ children }: { children: (again: () => void) => React.ReactNode }) {
  const [round, setRound] = useState(0);
  return <Fragment key={round}>{children(() => setRound((r) => r + 1))}</Fragment>;
}
