import AnnouncementBar from "@/components/shop/layout/AnnouncementBar";
import Breadcrumbs from "@/components/shop/layout/Breadcrumbs";
import Footer from "@/components/shop/layout/Footer";
import Header from "@/components/shop/layout/Header";
import OfferModal from "@/components/ui/OfferModal";
import "../globals.css"
import ModalManager from "@/components/ui/ModalManager";
import DeliveryContextBar from "@/components/shop/layout/DeliveryContextBar";

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
      < DeliveryContextBar />
      <Breadcrumbs />
      <main style={{ minHeight: '80vh' }}>
        <ModalManager/>
        {children}
      </main>
      <Footer />
    </>
  );
}