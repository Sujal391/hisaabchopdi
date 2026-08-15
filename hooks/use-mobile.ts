"use client";

import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 1024; // lg — matches sidebar collapse point

/**
 * Returns true when viewport width is below the mobile breakpoint (< lg).
 * Sidebar switches to Sheet drawer at this breakpoint.
 */
export function useMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
