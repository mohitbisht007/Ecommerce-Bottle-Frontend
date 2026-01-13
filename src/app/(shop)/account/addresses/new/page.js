export const dynamic = "force-dynamic";

"use client";

import { Suspense } from "react";
import dynamicImport from "next/dynamic";

// 1. Keep the dynamic import with SSR disabled
const AddressFormPage = dynamicImport(
  () => import('@/app/(shop)/components/AddressForm'),
  { ssr: false }
);

export default function AddAddressPage() {
  return (
    // 2. Wrap in Suspense. This is the "magic" that fixes prerender errors
    // for components that use params/searchParams/hooks.
    <Suspense fallback={<div className="loading-state">Loading Form...</div>}>
      <AddressFormPage />
    </Suspense>
  );
}