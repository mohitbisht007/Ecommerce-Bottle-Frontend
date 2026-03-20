import Image from "next/image";

export default function GallerySection({product, discount, activeImg, currentVariant, activeImgIdx, setActiveImgIdx}){
    return (
        <div className="gallery-column">
          <div className="sticky-gallery">
            <div className="main-display">
              {discount > 0 && (
                <span className="discount-tag">Save {discount}%</span>
              )}
              <button
                className="share-icon"
                onClick={() => {
                  navigator.share
                    ? navigator.share({
                        title: product.title,
                        url: window.location.href,
                      })
                    : navigator.clipboard.writeText(window.location.href);
                }}
              >
                📤
              </button>

              {/* Next.js Image with 'fill' requires the parent to be 'position: relative'.
          The 'hero-visual' class now handles the scaling via the CSS Fix 1 above.
      */}
              <Image
                src={activeImg}
                alt={product.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: "contain" }}
                className="hero-visual fade-in"
                key={activeImg}
              />

              <div className="gallery-nav-btns">
                <button
                  onClick={() =>
                    setActiveImgIdx((prev) =>
                      prev === 0 ? currentVariant.images.length - 1 : prev - 1
                    )
                  }
                >
                  ‹
                </button>
                <button
                  onClick={() =>
                    setActiveImgIdx((prev) =>
                      prev === currentVariant.images.length - 1 ? 0 : prev + 1
                    )
                  }
                >
                  ›
                </button>
              </div>
            </div>

            <div className="navigation-thumbnails">
              {currentVariant.images.map((img, i) => (
                <div
                  key={i}
                  className={`nav-thumb-item ${
                    i === activeImgIdx ? "active" : ""
                  }`}
                  onClick={() => setActiveImgIdx(i)}
                  style={{
                    position: "relative",
                    width: "70px",
                    height: "70px",
                  }}
                >
                  <Image
                    src={img}
                    alt="view"
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
    )
}