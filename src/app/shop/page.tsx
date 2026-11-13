import Shop from "@/components/storefront/Shop";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Shop | AUREL TIMEPIECES", description: "Explore the AUREL reference catalog of considered timepieces." };

export default function ShopPage() {
  return <Shop />;
}
