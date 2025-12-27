// src/components/Footer.jsx
'use client'

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        {/* Brand */}
        <div className="footer-col brand">
          <Link href="/" className="footer-logo">
            <span>BottleShop</span>
          </Link>
          <p className="footer-desc">
            Premium bottles for every lifestyle — steel, glass, kids and
            personalized designs. Quality you can trust.
          </p>

          <div className="socials">
            <a href="#" aria-label="Instagram">IG</a>
            <a href="#" aria-label="Facebook">FB</a>
            <a href="#" aria-label="Twitter">X</a>
          </div>
        </div>

        {/* Shop */}
        <div className="footer-col">
          <h4>Shop</h4>
          <ul>
            <li><Link href="/products?sort=newest">New Arrivals</Link></li>
            <li><Link href="/products?category=steel">Steel Bottles</Link></li>
            <li><Link href="/products?category=glass">Glass Bottles</Link></li>
            <li><Link href="/products?category=kids">Kids Bottles</Link></li>
            <li><Link href="/products?category=personalized">Personalized</Link></li>
          </ul>
        </div>

        {/* Help */}
        <div className="footer-col">
          <h4>Help</h4>
          <ul>
            <li><Link href="/account">My Account</Link></li>
            <li><Link href="/orders">Orders</Link></li>
            <li><Link href="/shipping">Shipping & Delivery</Link></li>
            <li><Link href="/returns">Returns</Link></li>
            <li><Link href="/contact">Contact Us</Link></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="footer-col newsletter">
          <h4>Stay in touch</h4>
          <p>Get updates on new launches and special offers.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Subscribed!");
            }}
          >
            <input type="email" placeholder="Enter your email" required />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} BottleShop. All rights reserved.</span>
        <div className="legal">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
