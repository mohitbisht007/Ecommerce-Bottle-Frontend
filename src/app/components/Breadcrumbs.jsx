"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumbs() {
  const pathname = usePathname();
  
  if (pathname === "/" || pathname === "/login" || pathname === "/signup") return null;

  const pathSegments = pathname.split("/").filter((item) => item !== "");

  return (
    <nav className="breadcrumb-container" aria-label="Breadcrumb">
      <div className="breadcrumb-inner">
        {/* Home Icon/Link */}
        <div className="bc-item">
          <Link href="/" className="bc-link">
            Home
          </Link>
        </div>

        {pathSegments.map((segment, index) => {
          const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
          const isLast = index === pathSegments.length - 1;
          
          // Formatting labels
          const label = segment
            .replace(/-/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());

          return (
            <div key={href} className="bc-item">
              <span className="bc-separator">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </span>
              
              {isLast ? (
                <span className="bc-current">{label}</span>
              ) : (
                <Link href={href} className="bc-link">
                  {label}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}