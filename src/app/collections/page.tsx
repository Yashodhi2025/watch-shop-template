import Collections from "@/components/storefront/Collections";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Collections | AUREL TIMEPIECES", description: "Explore Classic, Sport, Chronograph and Limited Edition collections." };

export default function CollectionsPage() {
  return <Collections />;
}
