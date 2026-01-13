async function getSettings() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/settings`, {
      next: { revalidate: 3600 } // Cache settings for 1 hour to keep it fast
    });
    const json = await res.json();
    return json.announcement?.enabled ? json.announcement : null;
  } catch (error) {
    console.error("Announcement fetch error:", error);
    return null;
  }
}

export default async function AnnouncementBar() {
  const data = await getSettings();

  if (!data) return null;

  return (
    <div 
      className="announcement-bar" 
      style={{ 
        backgroundColor: data.bgColor, 
        color: data.textColor,
        textAlign: 'center',
        padding: '8px 0',
        fontSize: '14px',
        fontWeight: '500'
      }}
    >
      <div className="container">
        <p style={{ margin: 0 }}>{data.text}</p>
      </div>
    </div>
  );
}