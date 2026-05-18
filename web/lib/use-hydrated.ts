"use client";

import * as React from "react";

/** true solo tras el primer mount en cliente (evita hydration mismatch con Radix). */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => setHydrated(true), []);
  return hydrated;
}
