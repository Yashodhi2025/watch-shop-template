import '../fonts/deneb-fonts.css';
import './globals.css';
import Providers from "./providers";
import initialSiteData from "@/data/site-data.json";
import type { Metadata } from "next";



export const metadata: Metadata = {
  title: `${initialSiteData.content.common.websiteTitle || "AUREL"} TIMEPIECES | The Art of Time`,
  description: initialSiteData.content.common.shortDescription || "A considered collection of exceptional luxury timepieces.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
