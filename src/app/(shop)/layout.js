import AnnouncementBar from "../components/AnnouncementBar";
import Footer from "../components/Footer";
import Header from "../components/Header";
import "../globals.css"

export const metadata = {
  title: "Bottle Shop",
  description: "Buy the best bottles",
};

export default async function ShopLayout({ children }) {

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
  const data = await res.json();

  return (
    <>
      <AnnouncementBar /> {/* Moved to top */}
      <Header initialCategories={data.categories} />
      <main style={{ minHeight: '80vh' }}>
        {children}
      </main>
      <Footer />
    </>
  );
}