// src/app/admin/page.js  (Server Component)
import AdminClient from "../components/AdminClient";

export default function AdminPage() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Admin — Product Manager</h1>
      <p className="small">Create new products. Must be logged in as admin.</p>
      <AdminClient />
    </div>
  );
}
