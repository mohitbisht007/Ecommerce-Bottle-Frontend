// src/components/AdminClient.jsx
'use client';

import { useState } from 'react';

export default function AdminClient() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    compareAtPrice: '',
    category: '',
    tags: '',
    images: '',
    sku: '',
    stock: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const clearForm = () => {
    setForm({
      title: '',
      description: '',
      price: '',
      compareAtPrice: '',
      category: '',
      tags: '',
      images: '',
      sku: '',
      stock: ''
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setMessage(null);

    // Basic client-side validation
    if (!form.title || !form.price) {
      setMessage({ type: 'error', text: 'Title and price are required.' });
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      setMessage({ type: 'error', text: 'No token found. Please login as admin and store token in localStorage (key: token).' });
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
      category: form.category.trim(),
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      images: form.images ? form.images.split(',').map(u => u.trim()).filter(Boolean) : [],
      sku: form.sku.trim() || undefined,
      stock: form.stock ? Number(form.stock) : 0
    };

    setLoading(true);
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
      const res = await fetch(`${base}/product/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `JWT ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data?.message || JSON.stringify(data) });
      } else {
        setMessage({ type: 'success', text: `Product created: ${data.title} (id: ${data._id})` });
        clearForm();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 760 }}>
      {message && (
        <div style={{ marginBottom: 12, color: message.type === 'error' ? 'crimson' : 'green' }}>
          {message.text}
        </div>
      )}

      <form onSubmit={submit} style={{ display: 'grid', gap: 8 }}>
        <label>
          Title *
          <input name="title" value={form.title} onChange={onChange} />
        </label>

        <label>
          Description
          <textarea name="description" value={form.description} onChange={onChange} rows={4} />
        </label>

        <div style={{ display: 'flex', gap: 8 }}>
          <label style={{ flex: 1 }}>
            Price *
            <input name="price" value={form.price} onChange={onChange} type="number" />
          </label>

          <label style={{ flex: 1 }}>
            Compare at price
            <input name="compareAtPrice" value={form.compareAtPrice} onChange={onChange} type="number" />
          </label>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <label style={{ flex: 1 }}>
            Category
            <input name="category" value={form.category} onChange={onChange} />
          </label>

          <label style={{ flex: 1 }}>
            SKU
            <input name="sku" value={form.sku} onChange={onChange} />
          </label>
        </div>

        <label>
          Tags (comma separated)
          <input name="tags" value={form.tags} onChange={onChange} placeholder="eco,steel,500ml" />
        </label>

        <label>
          Images (comma separated URLs)
          <input name="images" value={form.images} onChange={onChange} placeholder="https://... , https://..." />
        </label>

        <label>
          Stock
          <input name="stock" type="number" value={form.stock} onChange={onChange} />
        </label>

        <div style={{ marginTop: 8 }}>
          <button className="btn" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create product'}</button>
        </div>
      </form>
    </div>
  );
}
