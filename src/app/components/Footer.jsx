"use client";
import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, Youtube, Twitter, Send } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer dark-theme">
      <div className="footer-container">
        {/* SECTION 1: BRAND */}
        <div className="footer-brand-section">
          <Link href="/" className="footer-logo">
            <Image
              src="/logo1.png"
              alt="Bouncy Bucket"
              width={100}
              height={60}
              className="footer-logo-img brightness-filter"
            />
          </Link>
          <p className="footer-bio">
            Premium hydration solutions designed for the modern lifestyle.
            Engineering luxury, sustainability, and performance into every
            bottle.
          </p>
          <div className="social-links">
            <Link href="#" className="social-icon-btn">
              <Instagram size={18} />
            </Link>
            <Link href="#" className="social-icon-btn">
              <Facebook size={18} />
            </Link>
            <Link href="#" className="social-icon-btn">
              <Youtube size={18} />
            </Link>
            <Link href="#" className="social-icon-btn">
              <Twitter size={18} />
            </Link>
          </div>
        </div>

        {/* SECTION 2: NAVIGATION */}
        <div className="footer-links-group">
          <h4>Collection</h4>
          <ul>
            <li>
              <Link href="/shop">All Products</Link>
            </li>
            <li>
              <Link href="/shop?category=Steel">Steel Series</Link>
            </li>
            <li>
              <Link href="/shop?category=Glass">Glass Series</Link>
            </li>
            <li>
              <Link href="/shop?sort=newest">Limited Drops</Link>
            </li>
          </ul>
        </div>

        {/* SECTION 3: COMPANY */}
        <div className="footer-links-group">
          <h4>Assistance</h4>
          <ul>
            <li>
              <Link href="/track-order">Track Order</Link>
            </li>
            <li>
              <Link href="/faq">Common Questions</Link>
            </li>
            <li>
              <Link href="/shipping">Shipping Info</Link>
            </li>
            <li>
              <Link href="/contact">Contact Us</Link>
            </li>
          </ul>
        </div>

        {/* SECTION 4: NEWSLETTER */}
        <div className="footer-newsletter">
          <h4>The Guest List</h4>
          <p>Get early access to drops and sustainable living insights.</p>
          <form
            className="newsletter-form"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="input-wrapper">
              <input type="email" placeholder="Email Address" required />
              <button type="submit" className="newsletter-btn">
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="bottom-content">
          <p>&copy; {currentYear} Bouncy Bucket Luxury. All Rights Reserved.</p>

          <div className="payment-icons-row">
            <div className="payment-badge invert">
              <Image
                src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo.png"
                alt="UPI"
                width={45}
                height={18}
              />
            </div>
            <div className="payment-badge">
              <Image
                src="https://upload.wikimedia.org/wikipedia/commons/d/d6/Visa_2021.svg"
                alt="Visa"
                width={40}
                height={15}
              />
            </div>
            <div className="payment-badge">
              <Image
                src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                alt="Mastercard"
                width={30}
                height={20}
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
