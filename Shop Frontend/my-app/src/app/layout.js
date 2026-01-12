import Footer from "./components/Footer";
import Header from "./components/Header";
import "./globals.css"

export const metadata = {
  title: "Bottle Shop",
  description: "Buy the best bottles",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "sans-serif" }}>
        <Header />
        {children}
        <Footer/>
      </body>
    </html>
  );
}