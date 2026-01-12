import AnnouncementBar from "../components/AnnouncementBar";
import Footer from "../components/Footer";
import Header from "../components/Header";
import "../globals.css"

export const metadata = {
  title: "Bottle Shop",
  description: "Buy the best bottles",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "sans-serif" }}
      suppressHydrationWarning={true}
      >
        <Header />
        <AnnouncementBar />
        {children}
        <Footer/>
      </body>
    </html>
  );
}