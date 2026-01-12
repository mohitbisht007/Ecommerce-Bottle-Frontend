"use client";
import { useEffect, useState } from "react";

export default function AnnouncementBar() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/settings`)
      .then((res) => res.json())
      .then((json) => {
        if (json.announcement?.enabled) {
          setData(json.announcement);
        }
      })
      .catch(() => console.log("No announcement active"));
  }, []);

  if (!data) return null;

  return (
    <div 
      className="announcement-bar" 
      style={{ backgroundColor: data.bgColor, color: data.textColor }}
    >
      <div className="container">
        <p>{data.text}</p>
      </div>
    </div>
  );
}