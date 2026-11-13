"use client";

import { SiteDataProvider, ThemeStyles, ThemeToggle } from "@deneb-ui/ui";
import type { SiteData } from "@deneb-ui/ui";
import type { ComponentProps, ReactNode } from "react";
import initialSiteData from "@/data/site-data.json";

// Keep Deneb's CommonJS exports behind an explicit client boundary.
export default function Providers({ children }: { children: ReactNode }) {
  const data: SiteData = initialSiteData;
  const theme = (data.template?.structure?.theme || data.theme) as ComponentProps<typeof ThemeStyles>["theme"];
  return (
    <>
      <ThemeStyles theme={theme} enableDualMode />
      <SiteDataProvider initialSiteData={initialSiteData}>
        {children}
      </SiteDataProvider>
      <ThemeToggle className="theme-switcher" />
    </>
  );
}
