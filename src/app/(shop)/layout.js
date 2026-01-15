import AnnouncementBar from "../components/AnnouncementBar";
import Breadcrumbs from "../components/Breadcrumbs";
import Footer from "../components/Footer";
import Header from "../components/Header";
import "../globals.css"

export default async function ShopLayout({ children }) {
  const base = process.env.NEXT_PUBLIC_API_URL;
  let categories = [];

  try {
    const res = await fetch(`${base}/categories`, { next: { revalidate: 3600 } });
    
    // GUARD: Check if it's actually JSON
    if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
      const data = await res.json();
      categories = data.categories || [];
    }
  } catch (error) {
    console.error("Layout categories fetch failed:", error.message);
  }

  return (
    <>
      <AnnouncementBar />
      <Header initialCategories={categories} />
      <Breadcrumbs />
      <main style={{ minHeight: '80vh' }}>
        {children}
      </main>
      <Footer />
    </>
  );
}