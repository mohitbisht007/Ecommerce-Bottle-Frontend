import AnnouncementBar from "../components/AnnouncementBar";
import Footer from "../components/Footer";
import Header from "../components/Header";
import "../globals.css"

export const metadata = {
  title: "Bottle Shop",
  description: "Buy the best bottles",
};

export default function ShopLayout({ children }) {
  return (
    <>
      <AnnouncementBar /> {/* Moved to top */}
      <Header />
      <main style={{ minHeight: '80vh' }}>
        {children}
      </main>
      <Footer />
    </>
  );
}