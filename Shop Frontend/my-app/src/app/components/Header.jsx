// src/components/Header.jsx
import Link from 'next/link';

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <div className="brand">
          <Link href="/">Bottle Shop</Link>
        </div>

        <nav className="nav">
          <Link href="/" className="nav-link">Home</Link>
          <Link href="/products" className="nav-link">Products</Link>
          <Link href="/cart" className="nav-link">Cart</Link>
          <Link href="/login" className="nav-link">Login</Link>
        </nav>
      </div>
    </header>
  );
}
