import Link from "next/link";
import Image from "next/image"; // Recommended addition

export default function PromoCard({ title, image, href }) {
    return (
        <Link href={href} className="promo-card">
            {/* Use Next/Image for better banner loading */}
            <Image src={image} alt={title} fill priority style={{objectFit: 'cover'}} /> 
            <div className="overlay">
                <h2>{title} ➜</h2>
                <span className="btn font-bold">View All</span>
            </div>
        </Link>
    );
}