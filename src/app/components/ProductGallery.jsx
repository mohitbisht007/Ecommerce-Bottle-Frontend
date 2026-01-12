// src/components/ProductGallery.jsx
'use client';

import { useState } from 'react';

export default function ProductGallery({ images = [], title = '' }) {
  const [selected, setSelected] = useState(images?.[0] || '/placeholder.png');

  return (
    <div>
      <div style={{ background: '#faf5ff', borderRadius: 12, padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 360 }}>
        <img src={selected} alt={title} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12, overflowX: 'auto' }}>
        {images.map((img, idx) => (
          <button key={idx} onClick={() => setSelected(img)} style={{ border: selected === img ? '2px solid #ec4899' : '1px solid #eee', padding: 4, borderRadius: 8, background: '#fff' }}>
            <img src={img} alt={`thumb-${idx}`} style={{ width: 80, height: 80, objectFit: 'cover', display: 'block', borderRadius: 6 }} />
          </button>
        ))}
      </div>
    </div>
  );
}
