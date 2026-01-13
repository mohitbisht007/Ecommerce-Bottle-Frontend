import ProductEditor from "@/app/(admin)/components/ProductEditor";
import { use } from "react";

export default function Page({ params }) {
  // Unwrap the params using the 'use' hook for Next.js 15 compatibility
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  return <ProductEditor productId={id} />;
}