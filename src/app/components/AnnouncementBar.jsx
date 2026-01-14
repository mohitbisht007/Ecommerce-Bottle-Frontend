async function getSettings() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/settings`, {
      next: { revalidate: 3600 }
    });

    // 1. CHECK: Is the response actually JSON?
    const contentType = res.headers.get("content-type");
    if (!res.ok || !contentType || !contentType.includes("application/json")) {
      // If Render is sleeping or returning a 404 HTML page, just return null
      return null; 
    }

    // 2. SAFE TO PARSE: We know it's JSON now
    const json = await res.json();
    return json.announcement?.enabled ? json.announcement : null;
  } catch (error) {
    // This catches network timeouts or DNS errors
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