"use client";

import { SiteDataProvider, ThemeStyles, ThemeToggle, getThemeCssProperties, useSiteData } from "@deneb-ui/ui";
import type { SiteData } from "@deneb-ui/ui";
import type { ComponentProps, ReactNode } from "react";
import { useEffect } from "react";
import initialSiteData from "@/data/site-data.json";

function LiveThemeMode() {
  const data = useSiteData();
  useEffect(() => {
    const theme = (data.theme || data.template?.structure?.theme) as ComponentProps<typeof ThemeStyles>["theme"];
    if (!theme) return;
    const root = document.documentElement;
    // Preview snapshots set inline light-mode tokens. Keep those tokens in sync
    // with the existing toggle so live edits do not defeat the dark stylesheet.
    const sync = () => {
      const dark = root.classList.contains("dark");
      const active = dark ? { ...theme, backgroundColor: "#090d1a", textColor: "#f8fafc", mutedTextColor: "rgba(248,250,252,.7)", ...theme.dark } : theme;
      for (const [key, value] of Object.entries(getThemeCssProperties(active))) {
        if (key.startsWith("--") && value !== undefined) root.style.setProperty(key, String(value));
      }
      root.dataset.theme = dark ? "dark" : "light";
      root.style.colorScheme = dark ? "dark" : "light";
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [data]);
  return null;
}

// Keep Deneb's CommonJS exports behind an explicit client boundary.
export default function Providers({ children }: { children: ReactNode }) {
  const data: SiteData = initialSiteData;
  const theme = (data.template?.structure?.theme || data.theme) as ComponentProps<typeof ThemeStyles>["theme"];
  return (
    <>
      <ThemeStyles theme={theme} enableDualMode />
      <SiteDataProvider initialSiteData={initialSiteData}>
        <LiveThemeMode />
        {children}
      </SiteDataProvider>
      <ThemeToggle className="theme-switcher" />
    </>
  );
}
