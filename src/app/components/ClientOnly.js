"use client";
import { useEffect, useState } from "react";

export default function ClientOnly({ children }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // During Vercel's "Prerendering" build phase, hasMounted is false.
  // We return null to stop Vercel from executing any code inside 'children'.
  if (!hasMounted) return null; 

  return <>{children}</>;
}