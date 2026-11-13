"use client";

import { SiteDataProvider, ThemeStyles, ThemeToggle } from "@deneb-ui/ui";
import type { ReactNode } from "react";
import initialSiteData from "@/data/site-data.json";

// Keep Deneb's CommonJS exports behind an explicit client boundary.
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      <ThemeStyles theme={initialSiteData.template.structure.theme} enableDualMode />
      <SiteDataProvider initialSiteData={initialSiteData}>
        {children}
      </SiteDataProvider>
      <ThemeToggle showLabel className="fixed bottom-6 left-6 z-40" />
    </>
  );
}
