import PromoCard from "./PromoCard";
import AutoImageProductCard from "./AutoImageProductCard";

export default function SectionShowcase({
    title,
    promoImage,
    promoLink,
    products = [],
}) {
    return (
        // The .showcase-section CSS provides the two-column grid
        <section className="showcase-section"> 
            <PromoCard title={title} image={promoImage} href={promoLink} />

            <div className="products-grid">
                {products.slice(0, 4).map((p) => (
                    <AutoImageProductCard key={p._id} product={p} />
                ))}
            </div>
        </section>
    );
}